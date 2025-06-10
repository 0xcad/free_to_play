import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useFormStatus } from "react-dom";

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';
import routes from '~/constants/routes';

import LoginForm from './form.tsx';

import { useAppContext } from '~/context/AppContext';

const JoinForm: React.FC = () => {
  let navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAppContext();

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

  const { pending } = useFormStatus();

  return (
    <>
      <h1>Enter audience join code</h1>
      <p>You've created your account, {currentUser?.name}, we just need you to enter your audience join code.</p>

      <form action={handleSubmit}>
        <label>
          Join Code:
          <input name="join_code" type="text" id="join_code" required={true} value={formData.join_code} onChange={handleChange}/>
        </label>

        <button type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Submit"}
        </button>
      </form>
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
