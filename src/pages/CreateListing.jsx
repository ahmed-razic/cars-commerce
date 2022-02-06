import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { db } from '../firebase.config'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'

function CreateListing() {
  //eslint-disable-next-line
  const [geolocationEnabled, setGeolocationEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'sale',
    carMake: '',
    carModel: '',
    fuel: '',
    year: 2020,
    milage: 0,
    numberOfDoors: 4,
    airbags: 5,
    sensors: true,
    sunroof: true,
    allWheelDrive: false,
    images: {},
    address: '',
    latitude: 0,
    longitude: 0,
    offer: false,
    regularPrice: 30000,
    discountedPrice: 0,
  })

  const {
    name,
    type,
    carMake,
    carModel,
    fuel,
    year,
    milage,
    numberOfDoors,
    airbags,
    sensors,
    sunroof,
    allWheelDrive,
    images,
    address,
    latitude,
    longitude,
    offer,
    regularPrice,
    discountedPrice,
  } = formData

  const auth = getAuth()
  const navigate = useNavigate()
  const isMounted = useRef(true)

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid })
        } else {
          navigate('/sign-in')
        }
      })
    }

    return () => {
      isMounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  const onSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    if (discountedPrice >= regularPrice) {
      setLoading(false)
      toast.error('Discounted price needs to be less than regular price')
      return
    }

    if (images.length > 6) {
      setLoading(false)
      toast.error('Max 6 images')
      return
    }

    let geolocation = {}
    let location

    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      )

      const data = await response.json()

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0

      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address

      if (location === undefined || location.includes('undefined')) {
        setLoading(false)
        toast.error('Please enter a correct address')
        return
      }
    } else {
      geolocation.lat = latitude
      geolocation.lng = longitude
    }

    // Store image in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage()
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

        const storageRef = ref(storage, 'images/' + fileName)

        const uploadTask = uploadBytesResumable(storageRef, image)

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + progress + '% done')
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break
              case 'running':
                console.log('Upload is running')
                break
              default:
                break
            }
          },
          (error) => {
            reject(error)
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
            })
          }
        )
      })
    }

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false)
      toast.error('Images not uploaded')
      return
    })

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    }

    formDataCopy.location = address
    delete formDataCopy.images
    delete formDataCopy.location
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)
    setLoading(false)
    toast.success('Listin saved in database')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  const onMutate = (e) => {
    let boolean = null

    if (e.target.value === 'true') {
      boolean = true
    }
    if (e.target.value === 'false') {
      boolean = false
    }

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }))
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }))
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Create Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className='formLabel'>Name</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
            placeholder='Most affordable new car in town'
          />

          <div className='flex-column'>
            <div>
              <label className='formLabel'>Car Maker</label>
              <input
                className='formInputSmall'
                type='text'
                id='carMake'
                value={carMake}
                onChange={onMutate}
                maxLength='32'
                minLength='3'
                required
                placeholder='Volkswagen'
              />
            </div>
            <div>
              <label className='formLabel'>Car Model</label>
              <input
                className='formInputSmall'
                type='text'
                id='carModel'
                value={carModel}
                onChange={onMutate}
                maxLength='32'
                minLength='3'
                required
                placeholder='Golf 8'
              />
            </div>
            <div>
              <label className='formLabel'>Fuel</label>
              <input
                className='formInputSmall'
                type='text'
                id='fuel'
                value={fuel}
                onChange={onMutate}
                maxLength='10'
                minLength='3'
                required
                placeholder='Diesel'
              />
            </div>
            <div>
              <label className='formLabel'>Milage</label>
              <input
                className='formInputSmall'
                type='number'
                id='milage'
                value={milage}
                onChange={onMutate}
                max='999999'
                min='0'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Year</label>
              <input
                className='formInputSmall'
                type='number'
                id='year'
                value={year}
                onChange={onMutate}
                max='2030'
                min='2000'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Number of Doors</label>
              <input
                className='formInputSmall'
                type='number'
                id='numberOfDoors'
                value={numberOfDoors}
                onChange={onMutate}
                max='6'
                min='2'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Number of Airbags</label>
              <input
                className='formInputSmall'
                type='number'
                id='airbags'
                value={airbags}
                onChange={onMutate}
                max='10'
                min='0'
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking Sensors</label>
          <div className='formButtons'>
            <button
              className={sensors ? 'formButtonActive' : 'formButton'}
              type='button'
              id='sensors'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !sensors && sensors !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='sensors'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className='formLabel'>Sunroof</label>
          <div className='formButtons'>
            <button
              className={sunroof ? 'formButtonActive' : 'formButton'}
              type='button'
              id='sunroof'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !sunroof && sunroof !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='sunroof'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>All Wheel Drive</label>
          <div className='formButtons'>
            <button
              className={allWheelDrive ? 'formButtonActive' : 'formButton'}
              type='button'
              id='allWheelDrive'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !allWheelDrive && allWheelDrive !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type='button'
              id='allWheelDrive'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='address'
            value={address}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Create Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateListing
