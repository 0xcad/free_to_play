import { Outlet  } from "react-router";

import { useNavigate } from 'react-router';
import routes from '../constants/routes';

//import { useAppContext } from '../context/AppContext';

import Storage from '../utils/storage';
import { SESSION_KEY } from '../constants/api';

export function RequireAuth() {
  let navigate = useNavigate();
  const { currentUser } = useAppContext();

  /*if (!currentUser?.is_authenticated) {
    navigate(routes.join.link);
  }*/

  return ( <Outlet /> );
};

export function RequireJoin() {
  let navigate = useNavigate();
  const { currentUser } = useAppContext();

  /*if (!(currentUser?.is_authenticated && currentUser?.is_joined)) {
    navigate(routes.join.link);
  }*/

  return ( <Outlet /> );
}
