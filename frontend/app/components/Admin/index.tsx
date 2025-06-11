import type { Route } from "./+types/admin";
import React, { useEffect } from 'react';
import { useNavigate } from "react-router";
import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';
import { toast } from 'react-toastify';
import routes from '~/constants/routes';

import Chat from '~/components/Stage/Chat';

const Admin: React.FC = () => {
  let navigate = useNavigate();
  const { currentUser, ws, users, chat, play } = useAppContext();

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
  const muteUser = async (user_id: string) => {
    var old_value = users.users[user_id]?.is_muted;
    try {
      users.updateUser({id: user_id, is_muted: true});
      await Api.post(apiUrls.chat.mute, {user_id: user_id, muted: true});
    } catch (error) {
      users.updateUser({id: user_id, is_muted: old_value});
      if (error.response?.status == 404)
        toast.error("user not found");
    };
  }
  const unmuteUser = async (user_id: string) => {
    var old_value = users.users[user_id]?.is_muted;
    try {
      users.updateUser({id: user_id, is_muted: false});
      await Api.post(apiUrls.chat.mute, {user_id: user_id, muted: false});
    } catch (error) {
      users.updateUser({id: user_id, is_muted: old_value});
      if (error.response?.status == 404)
        toast.error("user not found");
    };
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

  const changeJoinCode = async () => {
    let code = prompt(`The current join code is ${play.playInstance.join_code}.\nNew join code:`);
    if (!code) return;
    var oldCode = play.playInstance.join_code;
    play.updatePlayInstance({join_code: code });
    try {
      await Api.post(apiUrls.play.update, {join_code: code});
    } catch (error) {
      play.updatePlayInstance({join_code: oldCode });
      console.log(error);
      toast.error("failed to update play instance...");
    }
  }

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h1>Admin Panel</h1>
      <div>
        <h2>Play</h2>
        <ul>
          <li>Join code: {play.playInstance.join_code}</li>
          <li>Status: {play.playInstance.status}</li>
          <li>Current Player: {play.playInstance.current_player}</li>
          <li>Timer: {play.playInstance.current_game_start}</li>
        </ul>


        { play.playInstance.status != "waiting" && (<button onClick={() => {updatePlayInstance({status: "waiting"})}}>Set status to "waiting"</button>)}
        { play.playInstance.status != "running" && (<button onClick={() => {updatePlayInstance({status: "running"})}}>Set status to "running"</button>)}
        { play.playInstance.status == "running" && (<button onClick={() => {updatePlayInstance({status: "finished"})}}>Set status to "finished"</button>)}
        <button onClick={changeJoinCode}>Change join code</button>
        <button onClick={() => {}}>Select new player</button>
        <button onClick={() => {}}>Start timer</button>
      </div>

      <div>
        <h2>Audience</h2>
        <ul>
          {Object.values(users.users).map((user) => (
            <li key={user.id}>
              {user.name} {''}
              <button onClick={() => kickUser(user.id)}>Kick</button>
              { user.is_muted ? (
                <button onClick={() => unmuteUser(user.id)}>Unmute</button>
              ) : (
                <button onClick={() => muteUser(user.id)}>Mute</button>
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
          unmuteUser={unmuteUser}
          deleteChatMessage={deleteChatMessage}
        />
      </div>
    </>
  );
};

export default Admin;
