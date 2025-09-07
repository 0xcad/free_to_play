import { useState, useEffect } from "react";

import type { WsState } from "../useWsState";
import type { UserState } from "../useUsersState";
import type { Item, ItemCategory, ItemPurchase } from "../models/Item";

import Api from '../utils/api';
import { apiUrls } from '../constants/api';

export interface StoreState {
  buyGemsModalIsOpen: boolean;
  setBuyGemsModalIsOpen: (isOpen: boolean) => void;
  items: Record<string, Item>;
  setItems: (items: Record<string, Item>) => void;

  categories?: Record<string, ItemCategory>;
  setCategories?: (categories: Record<string, ItemCategory>) => void;

  itemPurchases: Record<string, ItemPurchase>;
  setItemPurchases: (itemPurchases: Record<string, ItemPurchase>) => void;

  fetchItems: () => void;
  lastUpdatedInventory: Date;
  setLastUpdatedInventory: (date: Date) => void;
}

export function useStoreState(ws : WsState, currentUser : User, users: UserState): StoreState {
  const [items, setItems] = useState<Record<string, ChatMessage>>({});
  const [categories, setCategories] = useState<Record<string, ItemCategory>>({});
  const [itemPurchases, setItemPurchases] = useState<Record<string, ItemPurchase>>({});

  const [buyGemsModalIsOpen, setBuyGemsModalIsOpen] = useState<boolean>(false);

  const [lastUpdatedItems, setLastUpdatedItems] = useState<Date>(new Date(0));
  const [lastUpdatedInventory, setLastUpdatedInventory] = useState<Date>(new Date(0));

  const updateItem = (item: Item) => {
    if (!item) return;
    var updated_item = items[item.id];
    setItems((prev) => {
      return { ...prev, [item.id]: { ...updated_item, ...item }};
    });
  }

  // function to create item purchases
  const addItemPurchase = (ip: ItemPurchase) => {
    if (!ip) return;
    setItemPurchases((prev) => {
      if (prev[ip.id]) return prev;
      return { ...prev, [ip.id]: ip };
    });

    // increment item purchase count
    var item = items[ip.item_id];
    if (item && item !== undefined && ip.item_type === 'play' || ip.item_type === 'user' && ip.user_id === currentUser?.id) {
      // TODO: fix a bug that's here?
      updateItem({ ...item, count: item.count + 1 });
    }
    // increment user verified badge if applicable
    if (item && item.slug === 'verified') {
      var user = users.users[ip.user_id];
      if (user) {
        users.updateUser({ ...user, verified: user.verified + 1 });
      }
    }
  };

  const fetchItems = () => {
    const initialLoad = async () => {
      try {
        const response = await Api.get(apiUrls.store.list);
        // populate dictionary
        const dict: Record<string, Item> = {};
        response.items.forEach((m) => { dict[m.id] = m; });
        setItems(dict);

        const categoryDict: Record<string, ItemCategory> = {};
        response.categories.forEach((c) => { categoryDict[c.id] = c; });
        setCategories(categoryDict);
      } catch (error) {
        console.log(error);
        toast.error('Failed to load items.');
      } finally {
        setLastUpdatedItems(new Date());
      }
    }

    if (Date.now() - lastUpdatedItems.getTime() > 10 * 1000) { // throttle 10 seconds
      initialLoad();
    }
    else
      console.log("throttled store items load");
  }

  // if a websocket comes in with a new purchase, update itemPurchases
  useEffect(() => {
    ws.registerHandler("store.ItemPurchase.created", addItemPurchase);

    return () => {
      ws.registerHandler("store.ItemPurchase.created", addItemPurchase);
    };
  }, [ws.registerHandler, ws.unregisterHandler]);

  return {
    items, setItems,
    categories, setCategories,
    itemPurchases, setItemPurchases,

    buyGemsModalIsOpen, setBuyGemsModalIsOpen,

    fetchItems,
    lastUpdatedInventory, setLastUpdatedInventory,
  };
}

