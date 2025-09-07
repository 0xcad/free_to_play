import { useState, useEffect } from "react";
import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';
import type {ItemPurchase, Item} from '~/models/Item';

import { toast } from 'react-toastify';

import ItemDisplay from './ItemDisplay';


const Inventory: React.FC<{isAdmin?: boolean}> = ({isAdmin}) => {
  const { store, users, currentUser } = useAppContext();

  const playItemPurchases = !isAdmin ? (
    Object.values(store.itemPurchases).filter((item) => item.item_type === 'play')
  ) : Object.values(store.itemPurchases).sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  const userItemPurchases = !isAdmin ? (
    Object.values(store.itemPurchases).filter((item) => item.item_type === 'user')
  ) : [];

  // get item purchases on load
  useEffect(() => {
    const initialLoad = async () => {
      try {
        const response = await Api.get(apiUrls.store.inventory);

        const dict: Record<string, User> = {};
        response.forEach((m) => { dict[m.id] = m; });
        store.setItemPurchases(dict);

      } catch (error) {
        toast.error('Failed to load inventory.');
      } finally {
        store.setLastUpdatedInventory(new Date());
      }
    }

    if (Date.now() - store.lastUpdatedInventory.getTime() > 10 * 1000) { // throttle 10 seconds
      initialLoad();
    }
   }, [store.items, store.lastUpdatedInventory, store.setLastUpdatedInventory]);

  return (
    <div>
    <h3>Play Inventory</h3>
    { playItemPurchases.length > 0 ? (
      <ul className="item-wrapper">
        {Object.values(playItemPurchases).map((itemPurchase) => {
          const user = {...users.users[itemPurchase.user_id], is_me: currentUser?.id === itemPurchase.user_id};
          return (
            <ItemDisplay
              key={itemPurchase.id}
              item={store.items[itemPurchase.item_id]}
              user={user}
              purchaseDate={isAdmin ? itemPurchase.created : undefined}
            />
        )})}
      </ul>
    ) : (
      <p>No items in inventory.</p>
    )}
    <h3>User Inventory</h3>
    { userItemPurchases.length > 0 ? (
      <ul className="item-wrapper">
        {Object.values(userItemPurchases).map((itemPurchase) => (
          <ItemDisplay key={itemPurchase.id} item={store.items[itemPurchase.item_id]} />
        ))}
      </ul>
    ) : (
      <p>No items in inventory.</p>
    )}
    </div>
  );
}

export default Inventory;
