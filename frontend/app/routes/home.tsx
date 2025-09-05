import type { Route } from "./+types/home";
import { useNavigate } from "react-router";
import { useAppContext } from '~/context/AppContext';

import { useEffect } from 'react';

import routes from '~/constants/routes';

import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Free to Play" },
    { name: "description", content: "Free to Play, or Pay What You Will" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, play } = useAppContext();

  useEffect(() => {
    if (play.playInstance?.status === 'running') {
      if (currentUser?.is_authenticated && currentUser.is_joined) {
        navigate(routes.stage.link);
      }
      else if (currentUser?.is_authenticated) {
        navigate(routes.join.link);
      }
    }
  }, [currentUser, navigate]);

  return (
    <div>
      <h1>Free to Play</h1>
      <p>Free to Play, or Pay What You Will, is an upcoming experimental interactive theatre performance.</p>

      {play.playInstance && (
        <Link to={routes.join.link}>
          <button className='button primary mt-3'>Join the Play</button>
        </Link>
      )}
    </div>
  );
}
