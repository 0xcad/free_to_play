import { useState, useEffect, useCallback } from "react";

import { defaultPlayInstance } from '../models/PlayInstance';
import type { PlayInstance } from '../models/PlayInstance';
import type { User } from '../models/User';
import type { WsState } from "./useWsState";

import { useNavigate } from 'react-router';
import routes from '../constants/routes';

export interface PlayState {
  playInstance: PlayInstance;
  setPlayInstance: (p: PlayInstance) => void;
  updatePlayInstance: (p: any) => void;
}

export function usePlayState(ws: WsState, currentUser: User): PlayState {
  let navigate = useNavigate();
  const [playInstance, setPlayInstance] = useState<PlayInstance>(defaultPlayInstance());

  const updatePlayInstance= (playInstanceData) => {
    if (!playInstanceData) return;
    setPlayInstance((prev) => {
      return { ...prev, ...playInstanceData };
    });
  }

  // when a new websocket comes in, just set all the new data, redirect on appropriate status change...
  const wsUpdatePlayInstance = useCallback((data : PlayInstance) => {
    setPlayInstance(data);
  }, [currentUser, playInstance]);

  // if the play instance updates, set a new one
  useEffect(() => {
    ws.registerHandler("play.PlayInstance.updated", wsUpdatePlayInstance);

    return () => {
      ws.unregisterHandler("play.PlayInstance.updated", wsUpdatePlayInstance);
    };
  }, [ws.registerHandler, ws.unregisterHandler]);

  return { playInstance, setPlayInstance, updatePlayInstance };
}
