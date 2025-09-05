import { useAppContext } from '~/context/AppContext';

import React, { useEffect, useCallback, useState } from 'react';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';
import { toast } from 'react-toastify';

import type {ItemCategory, Item} from '~/models/Item';

import { motion } from "motion/react";
import Modal from '../shared/modal';
import Icon from '../shared/Icon';

import "./store.css";
import classnames from 'classnames';

const Store: React.FC = () => {
  const { currentUser, play, store, setCurrentUser } = useAppContext();
  const [ showInsufficientFunds, setShowInsufficientFunds ] = useState(false); 

  const buyItem = useCallback(async (item: Item) => {
    const itemId = item.id;

    if (!currentUser?.balance || item.cost > currentUser.balance) {
      setShowInsufficientFunds(true);
      return;
    }

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
  }, [currentUser, setShowInsufficientFunds]);


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
    <motion.div
      initial={{ marginLeft: -200 }}
      animate={{ marginLeft: 0 }}
      transition={{ type: "spring", bounce: 0.25 }}
      className="p-2 flex-grow"
    >
      <h1>store</h1>
      <p>All purchases go to <s>our incredible team</s> John Money, and will be used to deliver value to key stakeholders.</p>
      { store.categories && Object.values(store.categories).map((category) => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          {category.description && (<p>{category.description}</p>)}
          <ul className="item-wrapper">
            { category.items.map((itemId : number) => {
              const item = store.items[itemId];

              return item && (
              <li key={item.id} className="item p-2">
                <div className="flex gap-4">
                  <img src="https://placehold.co/100x100/EEE/31343C" />
                  <div>
                    <h3 className="my-2">{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="grid my-2">
                      <span className='item__field'>Cost</span> 
                      <span className={classnames(currentUser?.balance !== undefined && item.cost > currentUser.balance ? 'error' : '')}
                      >{item.cost} gems</span>
                      <span className='item__field'>Limit</span> 
                      <span>{item.quantity} left</span>
                    </div>
                  </div>
                </div>
                <button className="button mt-2" onClick={() => buyItem(item)}>Exchange</button>
              </li>
            )}) }
          </ul>
        </div>
      )) }
      <button className="button primary py-2 txt-md" onClick={() => store.setBuyGemsModalIsOpen(true)}>Buy Gems</button>

      <Modal
        title="C'mon, slowdown now"
        isOpen={showInsufficientFunds}
        onClose={() => {setShowInsufficientFunds(false);}}
      >
        <div className="p-3">
          <p>Whoaaa there pardner.</p>
          <p>Looking a little short on cash? Your wallet a little thin these days? You don't have enough <b className='gems-blue'>gems</b> to make this purchase</p>
          <p><b>Your balance:</b> <span className="gems-blue">{currentUser ? currentUser.balance : '0'} gems <Icon icon="gem" /> </span></p>
          <p><b class="error">Tip:</b> This country does have a king whom we bow down to, I speak to God in the US dollar.</p>
          <button className="button primary py-2 txt-md mt-2" onClick={() => {setShowInsufficientFunds(false); store.setBuyGemsModalIsOpen(true)}}>Buy Gems</button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Store;
