import { useState, useEffect, useCallback, useMemo } from "react";
import './BuyGemsModal.css';
import type { ModalProps } from '~/components/shared/modal';
import Modal from '~/components/shared/modal';
import { toast } from 'react-toastify';
import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls, stripePublicKey } from '~/constants/api';

import Icon from '~/components/shared/Icon';

import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

import useSound from 'use-sound';
import gemsSfx from '~/assets/sounds/gems.mp3';

import { AnimatePresence, motion } from "motion/react";

type GemProduct = {
  id: string;
  name: string;
  description: string;
  price: number; // in USD
  images: string[];
  gems: number;
};

const BuyGemsModal: React.FC<ModalProps> = ({
  isOpen, onClose
}) => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [gems, setGems] = useState(100);
  const [gemProducts, setGemProducts] = useState<GemProduct[]>([]);
  const [priceId, setPriceId] = useState<string | null>(null);

  const [playSuccess] = useSound(gemsSfx, { volume: 0.25, });

  const stripePromise = loadStripe(stripePublicKey);

  const handleCheckoutComplete = useCallback(() => {
    toast.success("Checkout completed successfully! Your gems will be added to your account.");
    setCurrentUser({
      ...currentUser,
      balance: currentUser.balance + gems
    });
    playSuccess();
    onClose();
    // in the backend, we update the user's balence using a webhook. just optimistically display that in the frontend
  }, [gems, currentUser, setCurrentUser, onClose]);

  const fetchClientSecret = useCallback(async () => {
    // Create a Checkout Session
    const response = await Api.post(apiUrls.store.create_checkout_session, {price_id: priceId});
    return response.clientSecret;
  }, [priceId]);

  const options = useMemo(() => ({
    fetchClientSecret,
    onComplete: handleCheckoutComplete,
  }), [fetchClientSecret, handleCheckoutComplete]);


  const fetchGems = useCallback(async () => {
    try {
      const response: GemProduct[] = await Api.get(apiUrls.store.gems);
      setGemProducts(response || []);
    } catch (error) {
      console.error("Error fetching gems:", error);
      toast.error("Failed to fetch gem products.");
    }
  }, [setGemProducts]);

  // fetch gem products when the component mounts
  useEffect(() => {
    fetchGems();
  }, [fetchGems]);

  const buyProduct = async (product : GemProduct) => {
    console.log("Buying product with ID:", product.id);
    setGems(product.gems);
    setPriceId(product.id);
    // this triggers the EmbeddedCheckout to show up
  }

  return (
    <Modal
      title="Buy Gems"
      isOpen={isOpen}
      onClose={onClose}
    >

      {/* TODO: add a loading spinner while the checkout session is being created
        Add a "close" button to this window, that sets priceId to null again
        Make this take up more space... */}
      <AnimatePresence>
      {priceId ? (
        <motion.div 
          className="stripe-wrapper"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          <button 
            className="modal-close-btn button w-auto flex-center font-alt"
            onClick={() => {setPriceId(null)}}
          >
            <Icon icon='back' />
          </button>
          <EmbeddedCheckoutProvider
            key={priceId}
            stripe={stripePromise}
            options={options}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </motion.div>
      ) : (
      <motion.ul 
        className="gem-products p-2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ type: "spring", bounce: 0.2 }}
      >
      { gemProducts.map((product) => (
        <li key={product.id}>
          {product.images && product.images.length > 0 && (
            <img src={product.images[0]} alt={product.name} />
          )}
          <h3>{product.name}</h3>
          {/*<p>{product.description}</p>*/}
          <div className="gems-amount flex-center"><Icon icon='gem' /> {product.gems} gems</div>
          <button className="button primary py-3 txt-md" onClick={() => {buyProduct(product)}}>
            ${product.price} USD
          </button>
        </li>
      ))}
      </motion.ul>
      )}
      </AnimatePresence>
    </Modal>
  );
}

export default BuyGemsModal;
