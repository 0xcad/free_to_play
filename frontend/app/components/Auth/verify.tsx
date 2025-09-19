import React, { useState,  useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';

import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';

import routes from '~/constants/routes';

const Verify: React.FC = () => {
  let navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setToken, setCurrentUser, play } = useAppContext();
  const [loginFailed, setLoginFailed] = useState(false);
  const hasVerified = useRef(false);

  const verifyParams = async (): Promise<void> => {
    const token = searchParams.get("token");
    const uid = searchParams.get("uid");

    const code = searchParams.get("code");

    // you either have a code (google), or a token and uid (email)
    if (! (code || (token && uid))) {
      console.log("invalid parameters");
      navigate(routes.join.link);
      return;
    }

    var data;
    if (token && uid) {
      data = {
        method: 'email',
        uid: uid,
        token: token,
      };
    }
    else if (code) {
      data = {
        method: 'google',
        code: code,
      };
    }

    try {
      const response = await Api.post(apiUrls.accounts.login, data);

      // set the token to authenticate the user
      response.user.is_authenticated = true;
      setCurrentUser(response.user);
      play.setPlayInstance(response.play_instance);

      if (response.user.is_joined)
        navigate(routes.stage.link);
      else
        navigate(routes.join.link);

      setToken(response.access);

    } catch (err) {
      console.log('this is the error we get', err);
      setLoginFailed(true);
    }
  };

  useEffect(() => {
    if (!hasVerified.current) {
      hasVerified.current = true;
      verifyParams();
    }
  }, []);

  return (
    <>
      <h1>Verifying...</h1>
      {loginFailed ? (
        <p>Login failed. <Link to={routes.join.link}>Retry?</Link></p>
      ) : (
        <p>Please wait on this page to complete sign-in...</p>
      )}
    </>
  );
}

export default Verify;
