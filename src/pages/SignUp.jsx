import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;
  const navigate = useNavigate();

  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }
  return (
    <div className='pageContainer'>
      <header>
        <p className='pageHeader'>Welcome to Sign Up!</p>
      </header>
      <form>
        <input
          type='text'
          name='name'
          id='name'
          placeholder='Name'
          value={name}
          className='nameInput'
          onChange={onChange}
        />
        <input
          type='email'
          name='email'
          id='email'
          placeholder='Email'
          value={email}
          className='emailInput'
          onChange={onChange}
        />
        <div className='passwordInputDiv'>
          <input
            type={showPassword ? 'text' : 'password'}
            name='password'
            id='password'
            placeholder='Password'
            className='passwordInput'
            value={password}
            onChange={onChange}
          />
          <img
            src={visibilityIcon}
            alt='show password'
            className='showPassword'
            onClick={() => {
              setShowPassword((prevState) => !prevState);
            }}
          />
        </div>
        <Link to='/forgot-password' className='forgotPasswordLink'>
          Forgot Password
        </Link>
        <div className='signUpBar'>
          <p className='signUpText'>Sign Up</p>
          <button className='signUpButton'>
            <ArrowRightIcon fill='white' width='34px' height='34px' />
          </button>
        </div>
      </form>

      <Link to='/sign-in' className='registerLink'>
        Sign In Instead
      </Link>
    </div>
  );
}

export default SignUp;
