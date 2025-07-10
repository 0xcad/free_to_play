import type { Route } from "./+types/home";
import { useAppContext } from '~/context/AppContext';

import React, { useState, useEffect, useCallback } from 'react';
import routes from '~/constants/routes';
import { useNavigate } from "react-router";
import Storage from '~/utils/storage';
import { SESSION_KEY, apiUrls } from '~/constants/api';

import Api from '~/utils/api';

import { toast } from 'react-toastify';
import BuyGemsModal from '~/components/Store/BuyGemsModal';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Free to Play | Account" },
    { name: "description", content: "Free to Play, or Pay What You Will" },
  ];
}

//just show the user's name and participation status as fields with placeholders as the values. detect if there's a change, and if so, display a `save` button that sends a PATCH request to the backend.

const Account: React.FC = () => {
  let navigate = useNavigate();
  const { currentUser, setCurrentUser, setToken, users, store } = useAppContext();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    is_participating: currentUser?.is_participating || false,
  });
  const [showSave, setShowSave] = useState(false);
  const [buyGemsModalIsOpen, setBuyGemsModalIsOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        is_participating: currentUser.is_participating || false,
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (formData.name !== currentUser?.name || formData.is_participating !== currentUser?.is_participating) {
      setShowSave(true);
    } else {
      setShowSave(false);
    }
  }, [formData, currentUser]);

  const handleLogout = () => {
    // TODO: make a backend request to invalidate current key. but anyways...
    Storage.remove(SESSION_KEY);
    setToken('');
    navigate(`${routes.join.link}`);
  };



  const updateAccount = async () => {
    try {
      const response = await Api.patch(apiUrls.accounts.update(currentUser.id), formData);
      toast.success("Successfully updated account.");
      users.updateUser(response);
      //setCurrentUser(response); ^should now be handled in updateUser
    } catch (error) {
      toast.error("Failed to update account.");
      console.log(error);
    };
  };

  if (!currentUser)
    return (<p>Loading current user...</p>)

  return (
    <>
      <h1>Account</h1>
      <span>Email: {currentUser.email}</span><br />
      <form>
        <p>
          <label htmlFor="name">Name: </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            placeholder={currentUser.name || 'Enter your name'}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </p>
        <p>
          <label>Participating: </label>
          <input
            type="radio"
            name="participating"
            id="participating"
            value="true"
            onChange={(e) => setFormData({ ...formData, is_participating: e.target.value === 'true' })}
            checked={formData.is_participating === true}
          />
          <label htmlFor="participating">Yes</label>
          <input
            type="radio"
            name="participating"
            id="not-participating"
            value="false"
            onChange={(e) => setFormData({ ...formData, is_participating: e.target.value === 'true' })}
            checked={formData.is_participating === false}
          />
          <label htmlFor="not-participating">No</label>
        </p>
      </form>
      <span>Balance: {currentUser.balance} gems</span> <button onClick={() => {store.setBuyGemsModalIsOpen(true);}}>Buy Gems!!</button>

      <p>
        {showSave && (<button onClick={updateAccount}>Save Changes</button> )} {' '}
        <button onClick={handleLogout}>Log out</button>
      </p>
    </>
  );
};

export default Account;
