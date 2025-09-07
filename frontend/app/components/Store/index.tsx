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

import type { StoreState } from '~/context/useStoreState';
import type { User } from '~/models/User';
import Inventory from '~/components/Store/Inventory';
import ItemDisplay from './ItemDisplay';

import useSound from 'use-sound';
import buySfx from '~/assets/sounds/item.mp3';

import classnames from 'classnames';


{/* TODO: make this a tab component, make tabs not unmount when you click off... */}
const Tabs: React.FC<{store : StoreState, currentUser: User, buyItem: (item : Item) => void}> = ({store, currentUser, buyItem}) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  useEffect(() => {
    if (store.categories && Object.values(store.categories).length > 0) {
      setSelectedTab(Object.values(store.categories)[0].id);
    }
  }, [store.categories]);

  const selectedCategory = store.categories ? Object.values(store.categories).find((c) => c.id === selectedTab) : undefined;
  const items = selectedCategory ? selectedCategory.items.map((itemId : number) => store.items[itemId]).filter((item) => item !== undefined) : [];

  return (
    <div className='tabs flex-column'>
      <div className='tab-list'>
        {store.categories && Object.values(store.categories).map((category) => (
          <button className={classnames('tab button w-auto flex-center', selectedTab === category.id ? 'active' : '')} onClick={() => setSelectedTab(category.id)} key={category.id}>
            {selectedTab == category.id ?  <motion.div
                className="underline"
                layoutId="underline"
                id="underline"
                transition={{ type: "spring", bounce: 0.4 }}
            /> : null}
            <span className="flex-center w-100 option__text">{category?.icon && (<><Icon icon={category.icon} />{' '}</>)} {category.name}</span>
          </button>
        ))}
        <button className={classnames('tab button w-auto flex-center', selectedTab === -1 ? 'active' : '')} onClick={() => setSelectedTab(-1)} key={-1}>
          {selectedTab == -1 ?  <motion.div
              className="underline"
              layoutId="underline"
              id="underline"
              transition={{ type: "spring", bounce: 0.4 }}
          /> : null}
          <span className="flex-center w-100 option__text"><Icon icon='inventory' /> Purchases</span>
        </button>
      </div>

      <div className='flex-column'>
        { selectedCategory && selectedCategory.items.length && (
          <>
          { selectedCategory.description && (<p className='mt-3 my-0'>{selectedCategory.description}</p>)}
          <ul className="item-wrapper">
            { items.sort((a, b) => {
                if (a.is_available === b.is_available) return 0;
                return a.is_available ? -1 : 1;
              }).map((item) => (
                <ItemDisplay
                  key={item.id}
                  item={item}
                  buyItem={buyItem}
                  user={currentUser}
                />
            ))}
          </ul>
          </>
        )}
        { selectedTab === -1 && (
          <Inventory />
        )}
      </div>
   </div>
  );
}

const Store: React.FC = () => {
  const { currentUser, play, store, setCurrentUser } = useAppContext();
  const [ showInsufficientFunds, setShowInsufficientFunds ] = useState(false);

  const [buyItemPlaying] = useSound(buySfx, { volume: 0.5, });

  const buyItem = useCallback(async (item: Item) => {
    const itemId = item.id;

    if (!currentUser?.balance || item.cost > currentUser.balance) {
      setShowInsufficientFunds(true);
      return;
    }

    try {
      const response = await Api.post(apiUrls.store.purchase(itemId));
      // update user balance
      setCurrentUser({
        ...currentUser,
        balance: currentUser.balance - item.cost,
      });

      buyItemPlaying();
      toast.success(`Successfully purchased ${item.name}!`);
    }
    catch (error) {
      console.error("Error purchasing item:", error);
      toast.error("Failed to purchase item. Please try again.");
    }
  }, [currentUser, setShowInsufficientFunds]);


  // get items on page load
  useEffect(() => {
    store.fetchItems();
  }, []);

  return (
    <motion.div
      initial={{ marginLeft: -200 }}
      animate={{ marginLeft: 0 }}
      transition={{ type: "spring", bounce: 0.25 }}
      className="p-2 flex-grow"
    >
      <h1>store</h1>
      <p>All purchases go to <s>our incredible team</s> John Money, and will be used to deliver value to key stakeholders.</p>
      <Tabs
        store={store}
        currentUser={currentUser}
        buyItem={buyItem}
      />

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
