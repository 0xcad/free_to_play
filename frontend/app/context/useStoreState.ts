import { useState } from "react";

import type { WsState } from "../useWsState";
import type { Item, ItemCategory } from "../models/Item";

export interface StoreState {
  buyGemsModalIsOpen: boolean;
  setBuyGemsModalIsOpen: (isOpen: boolean) => void;
  items: Record<string, Item>;
  setItems: (items: Record<string, Item>) => void;

  categories?: Record<string, ItemCategory>;
  setCategories?: (categories: Record<string, ItemCategory>) => void;
}

export function useStoreState(ws : WsState): StoreState {
  const [items, setItems] = useState<Record<string, ChatMessage>>({});
  const [categories, setCategories] = useState<Record<string, ItemCategory>>({});
  const [buyGemsModalIsOpen, setBuyGemsModalIsOpen] = useState<boolean>(false);

  return {
    items, setItems,
    categories, setCategories,
    buyGemsModalIsOpen, setBuyGemsModalIsOpen,
  };
}

