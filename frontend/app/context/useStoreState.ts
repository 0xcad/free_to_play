import { useState } from "react";

import type { WsState } from "~/context/useWsState";

export interface StoreState {
  items: string[];
  setItems: (items: string[]) => void;
}

export function useStoreState(ws : WsState): StoreState {
  const [items, setItems] = useState<string[]>([]);
  return { items, setItems };
}

