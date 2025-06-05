import { useState } from "react";

import type { PlayInstance } from '~/models/PlayInstance';
import type { WsState } from "~/context/useWsState";

export interface PlayState {
  playInstance: PlayInstance;
  setPlayInstance: (p: PlayInstance) => void;
}

export function usePlayState(ws: WsState): PlayState {
  const [playInstance, setPlayInstance] = useState<PlayInstance>(/* TODO */);

  // if the play instance updates, set a new one
  ws.registerHandler("play.PlayInstance.updated", setPlayInstance);

  return { playInstance, setPlayInstance };
}
