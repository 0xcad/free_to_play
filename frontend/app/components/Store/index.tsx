import type { Route } from "./+types/store";
import { useAppContext } from '~/context/AppContext';

import React, { useEffect } from 'react';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';
import { toast } from 'react-toastify';

import type {ItemCategory, Item} from '~/models/Item';

const Store: React.FC = () => {
  const { currentUser, play, store, setCurrentUser } = useAppContext();

  const buyItem = async (itemId: string) => {
    try {
      const response = await Api.post(apiUrls.store.purchase(itemId));
      // update user balance and inventory
      setCurrentUser({
        ...currentUser,
        balance: currentUser.balance - response.cost,
        inventory: [...currentUser.inventory, itemId]
      });

      // update play inventory
      if (response.item_type === 'play') {
        play.updatePlayInstance({
          inventory: [...play.playInstance.inventory, itemId]
        });
      }
      toast.success(`Successfully purchased ${response.name}!`);
    }
    catch (error) {
      console.error("Error purchasing item:", error);
      toast.error("Failed to purchase item. Please try again.");
    }
  }


  //get items on page load
  useEffect(() => {
    const initialLoad = async () => {
      try {
        const response = await Api.get(apiUrls.store.list);
        // populate dictionary
        const dict: Record<string, Item> = {};
        response.items.forEach((m) => { dict[m.id] = m; });
        store.setItems(dict);

        const categoryDict: Record<string, ItemCategory> = {};
        response.categories.forEach((c) => { categoryDict[c.id] = c; });
        store.setCategories(categoryDict);
      } catch (error) {
        console.log(error);
        toast.error('Failed to load items.');
      }
    }
    initialLoad();
  }, [store.setItems]);

  return (
    <>
      <h1>store</h1>
      <p>TODO: build this out more! add more items</p>
      { store.categories && Object.keys(store.categories).map((categoryId) => (
        <div key={categoryId}>
          <h2>{store.categories[categoryId].name}</h2>
          <ul>
            { store.categories[categoryId].items.map((itemId) => {
              const item = store.items[itemId];

              return item && (
              <li key={item.id}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>Price: {item.cost} gems</p>
                <button className="button" onClick={() => buyItem(item.id)}>Buy {item.name}</button>
              </li>
            )}) }
          </ul>
        </div>
      )) }
      <button className="button primary" onClick={() => store.setBuyGemsModalIsOpen(true)}>Buy Gems</button>
    </>
  );
};

export default Store;
