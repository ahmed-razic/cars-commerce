import { Link } from 'react-router-dom'
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg'
import { ReactComponent as EditIcon } from '../assets/svg/editIcon.svg'
import fuelIcon from '../assets/svg/fuelIcon.svg'
import milageIcon from '../assets/svg/milageIcon.svg'

function ListingItem({ listing, id, onDelete, onEdit }) {
  return (
    <li className='categoryListing'>
      <Link
        to={`/category/${listing.type}/${id}`}
        className='categoryListingLink'
      >
        <img
          src={listing.imgUrls[0]}
          alt={listing.carModel}
          className='categoryListingImg'
        />
        <div className='categoryListingDetails'>
          <p className='categoryListingLocation'>{listing.location}</p>
          <p className='categoryListingName'>{listing.carMake}</p>
          <p className='categoryListingName'>{listing.carModel}</p>
          <p className='categoryListingPrice'>
            $
            {listing.offer
              ? listing.discountedPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              : listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            {listing.type === 'rent' && ' / month'}
          </p>
          <div className='categoryListingInfoDiv'>
            <img src={fuelIcon} alt='fuel' />
            <p className='categoryListingInfoText'>{listing.fuel}</p>
            <img src={milageIcon} alt='milage' />
            <p className='categoryListingInfoText'>
              {listing.milage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
          </div>
        </div>
      </Link>
      {onDelete && (
        <DeleteIcon
          className='removeIcon'
          fill='rgb(231, 76, 60)'
          onClick={() => onDelete(listing.id, listing.name)}
        />
      )}

      {onEdit && <EditIcon className='editIcon' onClick={() => onEdit(id)} />}
    </li>
  )
}

export default ListingItem
