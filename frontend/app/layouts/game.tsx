import React, { useState,  useEffect } from 'react';
import { Outlet, NavLink  } from "react-router";
import { useAppContext } from '../context/AppContext';

import { useNavigate } from 'react-router';
import routes from '../constants/routes';

import Spinner from '../components/shared/spinner';

import { toast } from 'react-toastify';

export default function GameLayout() {
  let navigate = useNavigate();
  const { currentUser, play } = useAppContext();

  useEffect(() => {
    if (currentUser && !currentUser.is_joined) {
      navigate(routes.join.link);
    }
  }, [currentUser]);

  return (
    <>
      <nav>
        <NavLink to="/stage" end>
          Home
        </NavLink>
        <NavLink to="/store" end>Store</NavLink>
        <NavLink to="/account">Account</NavLink>
      </nav>
      { play?.playInstance?.status === 'waiting' && (
        <div>Waiting for the play to start <Spinner /></div>
      )}
      <Outlet />
    </>
  );
};
