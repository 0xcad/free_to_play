import type { Route } from "./+types/home";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useAppContext } from '~/context/AppContext';

import React, { useEffect } from 'react';

import GameLayout from '~/layouts/game';
import Stage from '~/components/Stage/';

import routes from '~/constants/routes';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Free to Play" },
    { name: "description", content: "Free to Play, or Pay What You Will" },
  ];
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, play } = useAppContext();

  useEffect(() => {
    if (play.playInstance?.status === 'running') {
      if (currentUser?.is_authenticated && currentUser.is_joined) {
        navigate(routes.stage.link);
        //return <Navigate to={routes.stage.link} state={{ from: location }} replace />;
      }
      else if (currentUser?.is_authenticated) {
        navigate(routes.join.link);
        //return <Navigate to={routes.join.link} replace />;
      }
    }
  }, [currentUser, navigate]);

  return (
    <div>
      <h1>Free to Play Home</h1>
      <p>Free to Play, or Pay What You Will, is an upcoming experimental interactive theatre performance.</p>
    </div>
  );
}
