import React, { useState, useCallback } from 'react';
import useToggle from '~/hooks/useToggle';
import { useFormStatus } from "react-dom";
import { useNavigate } from 'react-router';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';
import routes from '~/constants/routes';

import { useAppContext } from '~/context/AppContext';

const EmailForm: React.FC<{
  onSuccess: (result: null) => void;
}> = ({
  onSuccess
}) => {
  const { currentUser, setCurrentUser } = useAppContext();

  const [formData, setFormData] = useState({
    name: currentUser ? currentUser.name : '',
    email: currentUser ? currentUser.email : '',
    is_participating: (currentUser?.is_participating !== undefined) ? currentUser.is_participating : true,
  });
  const [emailError, setEmailError] = useState(false);

  const handleSubmit = async (values): Promise<void> => {
    // todo: make name a minimum of 5 chars?
    if (emailError || values.email === "" || values.name === "" || values.is_participating === "") {
      return;
    }

    try {
      const response = await Api.post(apiUrls.auth.create, values);
      setCurrentUser(response.user);
      onSuccess(response);
    } catch (err) {
      console.log('this is the error we get', err);
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
    <form action={handleSubmit}>
      <label>
        Email:
        <input name="email" type="email" id="email" required={true} value={formData.email} onChange={handleChange}/>
        { emailError && (<span>Error: invalid email address</span>)}
      </label>

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

      <br />
      <label>
        Name:
        <input name="name" type="text" id="name" required={true} value={formData.name} onChange={handleChange}/>
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          name="is_participating"
          checked={formData.is_participating}
          onChange={handleChange}
        />
        I want to participate in the show that calls for audience participation.
      </label>
      <br />
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

  return (
    <>
      <h1>Create account / log in</h1>
      <button disabled={true}>Continue with Apple</button>
      <button disabled={true}>Continue with Google</button>
      <button onClick={toggleShowEmail}>Continue with Email</button>

      { showEmail && (
        <EmailForm onSuccess={onSuccess} />
      )}
    </>
  );
}

export default LoginForm;
