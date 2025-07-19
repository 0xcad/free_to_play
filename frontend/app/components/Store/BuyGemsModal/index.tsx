import { useState, useEffect, useCallback, useMemo } from "react";
import './BuyGemsModal.css';
import type { ModalProps } from '~/components/shared/modal';
import Modal from '~/components/shared/modal';
import { toast } from 'react-toastify';
import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls, stripePublicKey } from '~/constants/api';

import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const BuyGemsModal: React.FC<ModalProps> = ({
  isOpen, onClose
}) => {
  const { users, currentUser, setCurrentUser } = useAppContext();
  const [gems, setGems] = useState(100);

  const stripePromise = loadStripe(stripePublicKey);

  const handleCheckoutComplete = useCallback(() => {
    toast.success("Checkout completed successfully! Your gems will be added to your account.");
    setCurrentUser({
      ...currentUser,
      balance: currentUser.balance + gems
    });
    console.log(gems, currentUser);
    onClose();
    // in the backend, we update the user's balence using a webhook. just optimistically display that in the frontend
  }, [gems, currentUser, setCurrentUser, onClose]);

  const fetchClientSecret = useCallback(async () => {
    // Create a Checkout Session
    console.log("Fetching client secret for checkout session...");
    const response = await Api.post(apiUrls.store.create_checkout_session);
    console.log(response.clientSecret);
    return response.clientSecret;
  }, []);

  const options = {
    fetchClientSecret,
    onComplete: handleCheckoutComplete,
  };

  const buyGems = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (isNaN(gems) || gems < 1 || gems > 1000) {
      toast.error("Please enter a valid number of gems between 1 and 1000.");
      return;
    }

    try {
      const response = await Api.post(apiUrls.store.buy_gems, { gems });
      users.updateUser({id: currentUser.id, balance: response.balance});
      toast.success(`Successfully purchased ${gems} gems!`);
      onClose();
    }
    catch(error) {
      toast.error("Failed to purchase gems. Please try again.");
      console.error("Error purchasing gems:", error);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <form>
        <h2>Buy Gems</h2>
        <p>How many gems we talking?</p>
        <input
          id="gems"
          name="gems"
          type="number"
          min="1"
          max="1000"
          placeholder="Enter number of gems"
          value={gems}
          onChange={(e) => {e.target.value ? setGems(Number(e.target.value)) : setGems('');}}
        />
        <p><i>TODO:</i> obviously this page is going to change a lot. it'll be this huge popup where you buy packets of fixed gems, will probably look like a mobile game. This will also be the only view that will use Stripe (i.e, ask for your credit card info)</p>
        <p>
          <button type="submit" onClick={buyGems}>Buy Gems</button> {' '}
          <button type="button" onClick={onClose}>Cancel</button>
       </p>
      </form>

      <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
    </Modal>
  );
}

export default BuyGemsModal;
