import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useFormStatus } from "react-dom";

import Api from '~/utils/api';
import { SESSION_KEY, apiUrls } from '~/constants/api';
import routes from '~/constants/routes';
import Storage from '~/utils/storage';

import LoginForm from './form.tsx';

import { useAppContext } from '~/context/AppContext';

const JoinForm: React.FC = () => {
  let navigate = useNavigate();
  const { currentUser, setCurrentUser, setToken } = useAppContext();

  const [formData, setFormData] = useState({
    join_code: '',
  });

  const handleSubmit = async (values): Promise<void> => {
    console.log('why is this running?');
    try {
      await Api.post(apiUrls.play.join, values);
      console.log('successfully joined the game');
      setCurrentUser((prevUser) => ({
        ...prevUser,
        is_joined: true,
      }));
      navigate(routes.stage.link);
    } catch (err) {
      console.log('this is the error we get', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogout = () => {
    // TODO: make a backend request to invalidate current key. but anyways...
    Storage.remove(SESSION_KEY);
    setToken('');
    setCurrentUser(null);
  };

  const { pending } = useFormStatus();

  return (
    <>
      <h1>Enter audience join code</h1>
      <p>You've created your account, {currentUser?.name}, we just need you to enter your audience join code.</p>

      <form action={handleSubmit} className='form'>
        <label>
          Join Code:
          <input name="join_code" type="text" id="join_code" required={true} value={formData.join_code} onChange={handleChange}/>
        </label>

        <button type="submit" className="mt-05" disabled={pending}>
          {pending ? "Submitting..." : "Submit"}
        </button>
      </form>


      <button onClick={handleLogout} className="button mt-3">Log out</button>
    </>
  );
}


const Join: React.FC = () => {
  let navigate = useNavigate();
  const { currentUser } = useAppContext();

  useEffect(() => {
    if (currentUser?.is_authenticated) {
      if (currentUser.is_joined) {
        navigate(routes.stage.link);
      }
    }
  }, [currentUser, navigate]);

  if (currentUser?.is_authenticated)
    return <JoinForm />;
  else
    return <LoginForm />;
}

export default Join;
