import { useState } from "react";

import type { WsState } from "../useWsState";

export interface StoreState {
  buyGemsModalIsOpen: boolean;
  setBuyGemsModalIsOpen: (isOpen: boolean) => void;
  items: string[];
  setItems: (items: string[]) => void;
}

export function useStoreState(ws : WsState): StoreState {
  const [items, setItems] = useState<string[]>([]);
  const [buyGemsModalIsOpen, setBuyGemsModalIsOpen] = useState<boolean>(false);
  return {
    items, setItems,
    buyGemsModalIsOpen, setBuyGemsModalIsOpen,
  };
}

