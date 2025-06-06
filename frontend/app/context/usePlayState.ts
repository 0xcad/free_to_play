import { useState, useEffect, useCallback } from "react";

import { defaultPlayInstance } from '../models/PlayInstance';
import type { PlayInstance } from '../models/PlayInstance';
import type { User } from '../models/User';
import type { WsState } from "./useWsState";

import { useNavigate } from 'react-router';
import routes from '../constants/routes';

import { toast } from 'react-toastify';

export interface PlayState {
  playInstance: PlayInstance;
  setPlayInstance: (p: PlayInstance) => void;
}

export function usePlayState(ws: WsState, currentUser: User): PlayState {
  let navigate = useNavigate();
  const [playInstance, setPlayInstance] = useState<PlayInstance>(defaultPlayInstance());

  const updatePlayInstance = useCallback((data : PlayInstance) => {
    if (playInstance.status === 'waiting' && data.status === 'running' && currentUser.is_joined) {
      console.log('firing!');
      if (window.location.pathname !== routes.stage.link)
        navigate(routes.stage.link);
      toast.info('the game has begun!');
    }
    setPlayInstance(data);
  }, [currentUser, playInstance]);

  // if the play instance updates, set a new one
  useEffect(() => {
    ws.registerHandler("play.PlayInstance.updated", updatePlayInstance);

    return () => {
      ws.unregisterHandler("play.PlayInstance.updated", updatePlayInstance);
    };
  }, [ws.registerHandler, ws.unregisterHandler]);

  return { playInstance, setPlayInstance };
}
