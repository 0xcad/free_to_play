import { useState, useEffect } from "react";
import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';

const Inventory: React.FC = ({}) => {
  const { store, currentUser, play } = useAppContext();

  // if a user has an item in their inventory that isn't in `items`, fetch inventory
  useEffect(() => {
    if (play.playInstance?.inventory && play.playInstance.inventory.length > 0) {
      const missingItems = play.playInstance.inventory.filter(item_id => !store.items[item_id]);
      const missingUserItems = currentUser.inventory.filter(item_id => !store.items[item_id]);
      missingItems.push(...missingUserItems);
      if (missingItems.length > 0) {
        Api.get(apiUrls.store.inventory).then(response => {
          const itemsDict: Record<string, any> = {};
          response.play.forEach(item => { itemsDict[item.id] = item; });
          store.setItems(prevItems => ({ ...prevItems, ...itemsDict }));

          // update play inventory
          play.updatePlayInstance({
            inventory: Object.keys(itemsDict)
          });
        }).catch(error => {
          console.error("Error fetching items:", error);
        });
      }
    }
  }, [play.playInstance?.inventory, currentUser?.inventory, store.items, store.setItems]);

  return (
    <div>
    <h3>Play Inventory</h3>
    { play.playInstance?.inventory && play.playInstance.inventory.length > 0 ? (
      <ul>
        {play.playInstance.inventory.map((item_id) => (
          <li key={item_id}>
            {store.items[item_id]?.name || `Item ${item_id} not found`}
            {store.items[item_id]?.description && <p>{store.items[item_id].description}</p>}
          </li>
        ))}
      </ul>
    ) : (
      <p>No items in inventory.</p>
    )}
    <h3>User Inventory</h3>
    { currentUser?.inventory && currentUser.inventory.length > 0 ? (
      <ul>
        {currentUser.inventory.map((item_id) => (
          <li key={item_id}>
            {store.items[item_id]?.name || `Item ${item_id} not found`}
            {store.items[item_id]?.description && <p>{store.items[item_id].description}</p>}
          </li>
        ))}
      </ul>
    ) : (
      <p>No items in inventory.</p>
    )}
    </div>
  );
}

export default Inventory;
