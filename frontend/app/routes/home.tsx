import type { Route } from "./+types/home";
import { Navigate, useLocation } from "react-router";
import { useAppContext } from '~/context/AppContext';

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
  const { currentUser } = useAppContext();

  if (currentUser?.is_authenticated && currentUser.is_joined) {
    return <Navigate to={routes.stage.link} state={{ from: location }} replace />;
  }
  else if (currentUser?.is_authenticated) {
    return <Navigate to={routes.join.link} replace />;
  }

  return (
    <div>
      <h1>Free to Play Home</h1>
    </div>
  );
}
