import { useState, useEffect, useCallback, useMemo } from "react";
import './BuyGemsModal.css';
import type { ModalProps } from '~/components/shared/modal';
import Modal from '~/components/shared/modal';
import { toast } from 'react-toastify';
import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls, stripePublicKey } from '~/constants/api';

import Icon from '~/components/shared/Icon';

/*import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';*/

import useSound from 'use-sound';
import gemsSfx from '~/assets/sounds/gems.mp3';

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
  const { users, currentUser, setCurrentUser } = useAppContext();
  const [gems, setGems] = useState(100);
  const [gemProducts, setGemProducts] = useState<GemProduct[]>([]);
  const [priceId, setPriceId] = useState<string | null>(null);

  const [playSuccess] = useSound(gemsSfx, { volume: 0.25, });

  //const stripePromise = loadStripe(stripePublicKey);

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
    console.log("Fetching client secret for checkout session...");
    const response = await Api.post(apiUrls.store.create_checkout_session, {price_id: priceId});
    console.log(response.clientSecret);
    return response.clientSecret;
  }, [priceId]);

  const options = useMemo(() => ({
    fetchClientSecret,
    onComplete: handleCheckoutComplete,
  }), [fetchClientSecret, handleCheckoutComplete]);


  const fetchGems = useCallback(async () => {
    try {
      const response: GemProduct[] = await Api.get(apiUrls.store.gems);
      console.log("Gems fetched:", response);
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
      <ul className="gem-products">
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
      </ul>


      {/* TODO: add a loading spinner while the checkout session is being created
        Add a "close" button to this window, that sets priceId to null again
        Make this take up more space... */}
      {/*priceId && (
        <EmbeddedCheckoutProvider
          key={priceId}
          stripe={stripePromise}
          options={options}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      }(*/}
    </Modal>
  );
}

export default BuyGemsModal;
