import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import routes from '~/constants/routes';

import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';

const LoginEmail: React.FC = () => {
  const { currentUser } = useAppContext();
  let navigate = useNavigate();

  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // if there is no current user, redirect to login page
  useEffect(() => {
    if (!currentUser) {
      navigate(routes.join.link);
    }
  }, []);


  const resendEmail = async (): Promise<void> => {
    try {
      await Api.post(apiUrls.accounts.resend, {user_id: currentUser?.id});
      setIsResendDisabled(true);
    } catch (err) {
      console.log('this is the error we get', err);
    }
  };

  // timer on resend email
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isResendDisabled) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isResendDisabled]);

  const recreateAccount = () => {
    navigate('/auth');
  };

  return (
    <>
      <h1>One more step!</h1>
      <p>We created your account. Now check your email for a login link.</p>
      {currentUser?.email && (<p>Your email: {currentUser.email}</p>)}
      <label>Didn't get one?
        <button className='button mt-05' onClick={resendEmail} disabled={isResendDisabled}>Resend code</button>
      </label>
      { isResendDisabled && (<p className="mono txt-sm">Email resent. Try again in {resendTimer} seconds</p> )}
      <label className="mt-1">Use a different email address? <button className="button mt-05" onClick={recreateAccount}>Recreate account</button></label>
    </>
  );
}

export default LoginEmail;
