import React, { useState,  useEffect, useCallback } from 'react';
import { Outlet, NavLink  } from "react-router";
import { useAppContext } from '../context/AppContext';

import { useNavigate } from 'react-router';
import routes from '../constants/routes';

import Spinner from '../components/shared/spinner';
import Modal from '../components/shared/modal';
import Icon from '../components/shared/Icon';
import BuyGemsModal from '../components/Store/BuyGemsModal';

import { toast } from 'react-toastify';
import "./game.css";

import useSound from 'use-sound';
import playSfx from '~/assets/sounds/play.mp3';

import type { PlayInstance } from '../models/PlayInstance';

export default function GameLayout() {
  let navigate = useNavigate();
  const { currentUser, play, ws, store } = useAppContext();
  const [currentPlayerModalIsOpen, setCurrentPlayerModalIsOpen] = useState(false);

  useEffect(() => {
    if (currentUser && !currentUser.is_joined) {
      navigate(routes.join.link);
    }
  }, [currentUser]);

  const [playPlaying] = useSound(playSfx, { volume: 0.5, });

  // when a new websocket comes in, just set all the new data, redirect on appropriate status change...
  const wsGameUpdatePlayInstance = useCallback((data : PlayInstance) => {
    if (play.playInstance.status === 'waiting' && data.status === 'running' && currentUser?.is_joined) {
      if (window.location.pathname !== routes.stage.link)
        navigate(routes.stage.link);
      toast.info('the game has begun!');
    }

    console.log("hey", data);
    if (data.current_player && play.playInstance.current_player != data.current_player && currentUser?.id === data.current_player) {
      toast.info('go on, get!');
      playPlaying();
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

  const tapContainer = React.useRef<HTMLDivElement>(null);
  const spawnTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // create a new div. set it's position to the click position
    if (!tapContainer.current) return;
    const clickX = e.clientX;
    const clickY = e.clientY;

    // create a new div
    const spawnDiv = document.createElement('div');
    spawnDiv.className = 'tap';
    spawnDiv.style.left = `${clickX}px`;
    spawnDiv.style.top = `${clickY}px`;

    // append it to the app content
    tapContainer.current.appendChild(spawnDiv);

    // remove it after 1 second
    setTimeout(() => {
      spawnDiv.remove();
    }, 1000);
  };



  return (
    <div className="app-content flex-column" onClick={spawnTap} ref={tapContainer}>
      <header>
        <p>Free to Play</p>
      </header>
      <div className="game-layout flex-grow position-relative flex-column overflow-y-auto">
        <div className="gems flex-center" onClick={() => {store.setBuyGemsModalIsOpen(true);}}><Icon icon='gem' /> {currentUser?.balance} gems</div>
        <Outlet />
      </div>

      { play?.playInstance?.status === 'waiting' && (
        <div className='waiting-bar flex-center'>Waiting for the play to start... <Spinner /></div>
      )}

      <nav className="game-nav">
        <ul>
          <li><NavLink to="/stage" end className="button flex-center"><Icon icon='theater'/> Home</NavLink></li>
          <li><NavLink to="/store" end className="button flex-center"><Icon icon='chest' /> Store</NavLink></li>
          <li><NavLink to="/account" className="button flex-center"><Icon icon='user' /> Account</NavLink></li>
        </ul>
      </nav>

      <Modal
        title="You've been selected!"
        isOpen={currentPlayerModalIsOpen}
        onClose={() => {setCurrentPlayerModalIsOpen(false);}}
      >
        <p className="p-3">Get on up there you big idiot, you've been selected to play the game!!</p>
      </Modal>

      <BuyGemsModal
        isOpen={store.buyGemsModalIsOpen}
        onClose={() => {store.setBuyGemsModalIsOpen(false);}}
      />
    </div>
  );
};
