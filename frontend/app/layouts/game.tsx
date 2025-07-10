import React, { useState,  useEffect, useCallback } from 'react';
import { Outlet, NavLink  } from "react-router";
import { useAppContext } from '../context/AppContext';

import { useNavigate } from 'react-router';
import routes from '../constants/routes';

import Spinner from '../components/shared/spinner';
import Modal from '../components/shared/modal';
import BuyGemsModal from '../components/Store/BuyGemsModal';

import { toast } from 'react-toastify';

export default function GameLayout() {
  let navigate = useNavigate();
  const { currentUser, play, ws, store } = useAppContext();
  const [currentPlayerModalIsOpen, setCurrentPlayerModalIsOpen] = useState(false);

  useEffect(() => {
    if (currentUser && !currentUser.is_joined) {
      navigate(routes.join.link);
    }
  }, [currentUser]);

  // when a new websocket comes in, just set all the new data, redirect on appropriate status change...
  const wsGameUpdatePlayInstance = useCallback((data : PlayInstance) => {
    if (play.playInstance.status === 'waiting' && data.status === 'running' && currentUser.is_joined) {
      if (window.location.pathname !== routes.stage.link)
        navigate(routes.stage.link);
      toast.info('the game has begun!');
    }

    if (data.current_player && play.playInstance.current_player?.id != data.current_player.id && currentUser?.id === data.current_player.id) {
      toast.info('go on, get!');
      setCurrentPlayerModalIsOpen(true);
    }
  }, [currentUser, play.playInstance]);

  // if the play instance updates, set a new one
  useEffect(() => {
    ws.registerHandler("play.PlayInstance.updated", wsGameUpdatePlayInstance);

    return () => {
      ws.unregisterHandler("play.PlayInstance.updated", wsGameUpdatePlayInstance);
    };
  }, [ws.registerHandler, ws.unregisterHandler]);

  return (
    <>
      <nav>
        <NavLink to="/stage" end>
          Home
        </NavLink>{' '}
        <NavLink to="/store" end>Store</NavLink>{' '}
        <NavLink to="/account">Account</NavLink>
      </nav>
      { play?.playInstance?.status === 'waiting' && (
        <div>Waiting for the play to start <Spinner /></div>
      )}
      <div onClick={() => {store.setBuyGemsModalIsOpen(true);}}>Balance: {currentUser?.balance} gems</div>
      <Modal
        isOpen={currentPlayerModalIsOpen}
        onClose={() => {setCurrentPlayerModalIsOpen(false);}}
      >
        <p>Get on up there you big idiot, you've been selected to play the game!!</p>
      </Modal>

      <BuyGemsModal
        isOpen={store.buyGemsModalIsOpen}
        onClose={() => {store.setBuyGemsModalIsOpen(false);}}
      />
      <Outlet />
    </>
  );
};
