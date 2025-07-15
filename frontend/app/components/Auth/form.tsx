import React, { useState, useCallback, useEffect } from 'react';
import useToggle from '~/hooks/useToggle';
import { useFormStatus } from "react-dom";
import { useNavigate, useLocation } from 'react-router';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';
import routes from '~/constants/routes';

import { useAppContext } from '~/context/AppContext';
import GoogleLoginButton from './GoogleLoginButton';

import './EmailForm.css';

const EmailForm: React.FC<{
  onSuccess: (result: null) => void;
}> = ({
  onSuccess
}) => {
  const location = useLocation();
  const { currentUser, setCurrentUser } = useAppContext();

  const [formData, setFormData] = useState({
    name: currentUser ? currentUser.name : '',
    email: currentUser ? currentUser.email : '',
    is_participating: (currentUser?.is_participating !== undefined) ? currentUser.is_participating : true,
  });
  const [emailError, setEmailError] = useState(false);
  const [joinCode, setJoinCode] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!joinCode)
      setJoinCode(params.get('join_code', ""));
  }, []);

  const handleSubmit = async (values): Promise<void> => {
    // todo: make name a minimum of 5 chars?
    if (emailError || values.email === "" || values.name === "" || values.is_participating === "") {
      return;
    }

    try {
      const response = await Api.post(apiUrls.accounts.create, values);
      setCurrentUser(response.user);
      onSuccess(response);
    } catch (err) {
      console.log('this is the error we get', err);
      if (response.email)
        setEmailError(response.email);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value, // Handle checkbox differently
    });
  };

  const { pending } = useFormStatus();

  return (
    <form action={handleSubmit} className="form email-form">
      <p>
        <label>Email</label>
        <input name="email" type="email" id="email" required={true} value={formData.email} onChange={handleChange}/>
        { emailError && (<span>Error: invalid email address</span>)}
      </p>

      {
      /*<br />
      <label>
        <input
          type="checkbox"
          checked={false}
          onChange={(e) => {console.log(e);}}
        />
        I have an account already
      </label>*/
      }

      <p>
        <label>Name</label>
        <input name="name" type="text" id="name" required={true} value={formData.name} onChange={handleChange}/>
      </p>

      <p className='flex'>
        <input
          type="checkbox"
          name="is_participating"
          id="is_participating"
          checked={formData.is_participating}
          onChange={handleChange}
        />
        <label htmlFor="is_participating">I may be selected for audience participtation</label>
      </p>

      <input name="join_code" type="hidden" id="join_code" value={joinCode}/>
      <button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

const LoginForm: React.FC = () => {
  let navigate = useNavigate();

  const [showEmail, toggleShowEmail] = useToggle(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);

  const onSuccess = useCallback((response) => {
    navigate(routes.loginEmail.link);
  }, [setShowEmailSuccess]);

  const recreateAccount = () => {
    setShowEmailSuccess(false);
    toggleShowEmail(true);
  };

  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      setPageLoaded(true);
    };
    window.addEventListener('load', handleLoad);
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <>
      <h1>Join the Game</h1>
      <div class='buttons'>
        {/*<button disabled={true}>Continue with Apple</button>*/}
        <GoogleLoginButton />

        <button onClick={toggleShowEmail} className={showEmail ? "active" : ""}>Continue with Email</button>
      </div>

      { showEmail && (
        <EmailForm onSuccess={onSuccess} />
      )}
    </>
  );
}

export default LoginForm;
