import type { Route } from "./+types/home";
import { useAppContext } from '~/context/AppContext';

import React, { useState, useEffect, useCallback } from 'react';
import routes from '~/constants/routes';
import { useNavigate } from "react-router";
import Storage from '~/utils/storage';
import { SESSION_KEY, apiUrls } from '~/constants/api';

import Icon from '~/components/shared/Icon';
import classnames from 'classnames';

import Api from '~/utils/api';

import { toast } from 'react-toastify';
import { AnimatePresence, motion } from "motion/react"

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

  const [selectedOption, setSelectedOption] = useState(formData.is_participating ? 'yes' : 'no');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        is_participating: currentUser.is_participating || false,
      });
      setSelectedOption(currentUser.is_participating ? 'yes' : 'no');
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

  const toggleParticipation = () => {
    setSelectedOption(selectedOption === 'yes' ? 'no' : 'yes');
    setFormData({
      ...formData,
      is_participating: selectedOption === 'yes' ? false : true,
    });
  };

  if (!currentUser)
    return (<p>Loading current user...</p>);
  return (
    <>
      <h1>Account</h1>
      <p><label className="label flex">@ Email</label> {currentUser.email}</p>
      <form className='form'>
        <p>
          <label className="label flex" htmlFor="name"><Icon icon="user" /> Name</label>
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
          <label className="label flex"><Icon icon="theater" /> Participating</label>
          <div className='switch'>
            <div className={classnames('option button w-auto', selectedOption === 'yes' ? 'active' : '')} onClick={toggleParticipation}>
              {selectedOption == 'yes' ? <motion.div
                  className="underline"
                  layoutId="underline"
                  id="underline"
                  transition={{ type: "spring", bounce: 0.25 }}
                /> : null}
              <span className='option__text'>Yes</span>
            </div>
            <div className={classnames('option button w-auto', selectedOption === 'no' ? 'active' : '')} onClick={toggleParticipation}>
              {selectedOption == 'no' ? <motion.div
                className="underline"
                layoutId="underline"
                id="underline"
                transition={{ type: "spring", bounce: 0.25 }}
                /> : null}
              <span className='option__text'>No</span>
            </div>
          </div>
          {/*<input
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
          <label htmlFor="not-participating">No</label>*/}
        </p>
      </form>
      <p><label className="label flex"><Icon icon="gem" /> Balance</label> {currentUser.balance} gems</p>
      <button className="button primary my-2 py-2" onClick={() => {store.setBuyGemsModalIsOpen(true);}}>Buy Gems</button>

      <div className='buttons'>
        <AnimatePresence>
          {showSave && (
            <motion.button
              className="primary"
              onClick={updateAccount}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              key="save-button"
            >
              Save Changes
            </motion.button>
          )}
        </AnimatePresence>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </>
  );
};

export default Account;
