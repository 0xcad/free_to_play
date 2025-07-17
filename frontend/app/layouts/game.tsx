import React, { useState,  useEffect, useCallback } from 'react';
import { Outlet, NavLink  } from "react-router";
import { useAppContext } from '../context/AppContext';

import { useNavigate } from 'react-router';
import routes from '../constants/routes';

import Spinner from '../components/shared/spinner';
import Modal from '../components/shared/modal';
import BuyGemsModal from '../components/Store/BuyGemsModal';

import { toast } from 'react-toastify';
import "./game.css";

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
    <div className="game-layout-container">
      <div className="game-layout">
        <nav className="game-nav">
          <ul>
            <li><NavLink to="/stage" end>Home</NavLink></li>
            <li><NavLink to="/store" end>Store</NavLink></li>
            <li><NavLink to="/account">Account</NavLink></li>
          </ul>
        </nav>

        { play?.playInstance?.status === 'waiting' && (
          <div className='waiting-bar'>Waiting for the play to start <Spinner /></div>
        )}

        <div className="game-content">
          <Outlet />
        </div>
      </div>

      <div className="gems" onClick={() => {store.setBuyGemsModalIsOpen(true);}}>❇️ {currentUser?.balance} gems</div>
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
    </div>
  );
};
