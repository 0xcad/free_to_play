import type { Route } from "./+types/admin";
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router";
import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';
import { toast } from 'react-toastify';
import routes from '~/constants/routes';

import Chat from '~/components/Stage/Chat';
import Modal from '~/components/shared/modal';

import Inventory from '~/components/Store/Inventory';

import "./admin.css";

const Admin: React.FC = () => {
  let navigate = useNavigate();
  const { currentUser, ws, users, chat, play, store } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(undefined);

  useEffect(() => {
    if (currentUser && !currentUser.is_admin) {
      toast.error("You are not authorized to access the admin panel.");
      navigate(routes.home.link);
      return;
    }
  }, [currentUser]);

  const kickUser = async (user_id: string) => {
    try {
      await Api.post(apiUrls.chat.kick, {user_id: user_id});
      toast.success("User kicked successfully.");
      users.removeUser(user_id);
    } catch (error) {
      console.log(error);
    };
  }

  const muteUser = async (user_id: string, is_muted: boolean) => {
    var old_value = users.users[user_id]?.is_muted;
    try {
      users.updateUser({id: user_id, is_muted: is_muted});
      if (is_muted)
        await Api.put(apiUrls.accounts.mute(user_id));
      else
        await Api.delete(apiUrls.accounts.mute(user_id));
    } catch (error) {
      users.updateUser({id: user_id, is_muted: old_value});
      if (error.response?.status == 404)
        toast.error("user not found");
    };
  }

  // TODO: make this optimistic?
  const updateUser = async (user_id: string, data: any) => {
    try {
      const response = await Api.patch(apiUrls.accounts.update(user_id), data);
      users.updateUser(response);
    } catch (error) {
      console.log(error);
      toast.error("failed to update user...");
    }
  }

  const deleteChatMessage = async (message_id: string) => {
    try {
      await Api.delete(apiUrls.chat.delete(message_id));
      toast.success("Message deleted successfully.");
      chat.removeChatMessage(message_id);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete message.");
    }
  }

  const readChatMessage = (msg: ChatMessage) => {
    if (!(msg && msg.read_aloud && !msg.system))
      return
    const synth = window.speechSynthesis;
    const voices = synth.getVoices().filter((v) => v.lang.startsWith("en-US"))
    //const voiceIndex = Math.floor(Math.random() * voices.length);
    // everyone gets a unique voice
    const voice = voices[msg.user_id % voices.length];
    const utterThis = new SpeechSynthesisUtterance(msg.content);
    utterThis.voice = voice;
    synth.speak(utterThis);
  }

  // if a websocket comes in with a new chat message, read it if needed
  useEffect(() => {
    ws.registerHandler("chat.ChatMessage.created", readChatMessage);

    return () => {
      ws.unregisterHandler("chat.ChatMessage.created", readChatMessage);
    };
  }, [ws.registerHandler, ws.unregisterHandler]);

  const updatePlayInstance = async (data: any) => {
    try {
      var oldPI = play.playInstance;
      play.updatePlayInstance(data);
      await Api.post(apiUrls.play.update, data);
    } catch (error) {
      play.setPlayInstance(oldPI);
      console.log(error);
      toast.error("failed to update play instance...");
    }
  }

  const changeField = async (field: string) => {
    const currentValue = play.playInstance[field];
    const newValue = prompt(`The current ${field} is ${currentValue}.\nNew ${field}:`);
    updatePlayInstance({ [field]: newValue });
  }

  const selectPlayer = async (exclude?: string[]) => {
    try {
      const data = exclude ? {exclude: exclude} : {};
      const response = await Api.post(apiUrls.play.select_player, data);
      setSelectedPlayer(response.current_player);
      //play.updatePlayInstance({current_player: response.current_player });
      setIsModalOpen(true);
    } catch (error) {
      console.log(error);
    }
  }

  // get items on page load
  useEffect(() => {
    store.fetchItems();
  }, []);

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <>
    <h1>Admin Panel</h1>
    <div className='admin-grid'>
      <div>
        <h2>Play</h2>
        <ul>
          <li>Join code: {play.playInstance.join_code} <button onClick={() => {changeField('join_code')}}>Change join code</button></li>
          <li>Status: {play.playInstance.status}</li>
          <li>Current Player: {play.playInstance.current_player?.name}</li>
          <li>Stream URL: {play.playInstance.stream_url} <button onClick={() => {changeField('stream_url')}}>Change</button></li>
        </ul>


        { play.playInstance.status != "waiting" && (<button onClick={() => {updatePlayInstance({status: "waiting"})}}>Set status to "waiting"</button>)}
        { play.playInstance.status != "running" && (<button onClick={() => {updatePlayInstance({status: "running"})}}>Set status to "running"</button>)}
        { play.playInstance.status == "running" && (<button onClick={() => {updatePlayInstance({status: "finished"})}}>Set status to "finished"</button>)}
        <button onClick={() => {selectPlayer()}}>Select new player</button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {setIsModalOpen(false)}}
        >
          <p>Selected the player <b>{selectedPlayer?.name}</b> to play next</p>
          <p>Would you like to re-roll? <button onClick={() => {selectPlayer([selectedPlayer?.id])}}>Re-roll</button></p>
          <p><button onClick={() => {
            updatePlayInstance({current_player: selectedPlayer.id});
            setIsModalOpen(false);
          }}>Confirm</button></p>
        </Modal>
      </div>

      <div>
        <h2>Audience</h2>
        <ul>
          {/*Consider turning this to a table. Name, balance, actions, statuses*/}
          {Object.values(users.users).map((user) => (
            <li key={user.id}>
              {user.name} {''}
              {!user.is_admin && (
                <>
                  <button onClick={() => {kickUser(user.id)}}>Kick</button>
                  { user.is_muted ? (
                    <button onClick={() => {muteUser(user.id, false)}}>Unmute</button>
                  ) : (
                    <button onClick={() => {muteUser(user.id, true)}}>Mute</button>
                  )}
                  {play.playInstance.current_player?.id != user.id ? (<button onClick={() => {updatePlayInstance({current_player: user.id});}}>Set as current player</button>)
                    : (<button onClick={() => {updatePlayInstance({current_player: null});}}>unset as current player</button>)}
                  {!user.has_played ? (<button onClick={() => {updateUser(user.id, {has_played: true});}}>set has played</button>)
                    : (<button onClick={() => {updateUser(user.id, {has_played: false});}}>unset has played</button>)}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Chat</h2>
        <Chat
          kickUser={kickUser}
          muteUser={muteUser}
          deleteChatMessage={deleteChatMessage}
        />
      </div>

      <div>
        <h2>Inventory</h2>
        <Inventory isAdmin={true} />
      </div>
    </div>
    </>
  );
};

export default Admin;
