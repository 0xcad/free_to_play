import React, { useState,  useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';

import routes from '~/constants/routes';

const Verify: React.FC = () => {
  let navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setToken, setCurrentUser, play } = useAppContext();
  const hasVerified = useRef(false);

  const verifyParams = async (): Promise<void> => {
    const token = searchParams.get("token");
    const uid = searchParams.get("uid");

    if (!token || !uid) {
      console.log("invalid parameters");
      navigate(routes.join.link);
      return;
    }

    try {
      var response = await Api.get(apiUrls.auth.login(uid, token));

      // set the token to authenticate the user
      setToken(response.access);
      response.user.is_authenticated = true;
      setCurrentUser(response.user as User);
      play.setPlayInstance(response.play_instance);

      if (response.user.is_joined)
        navigate(routes.stage.link);
      else
        navigate(routes.join.link);

    } catch (err) {
      console.log('this is the error we get', err);
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
      <p>{ searchParams.get("token") }</p>
      <p>{ searchParams.get("uid") }</p>
    </>
  );
}

export default Verify;
