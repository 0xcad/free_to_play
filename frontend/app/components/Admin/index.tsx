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
      navigate(routes.home);
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
      await Api.post(apiUrls.chat.mute, {user_id: user_id, muted: true});
      users.updateUser({id: user_id, is_muted: true});
    } catch (error) {
      users.updateUser({id: user_id, is_muted: old_value});
      if (error.response?.status == 404)
        toast.error("user not found");
    };
  }
  const unmuteUser = async (user_id: string) => {
    var old_value = users.users[user_id]?.is_muted;
    try {
      await Api.post(apiUrls.chat.mute, {user_id: user_id, muted: false});
      users.updateUser({id: user_id, is_muted: false});
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

        <button onClick={() => {}}>Set status to "waiting"</button>
        <button onClick={() => {}}>Set status to "finished"</button>
        <button onClick={() => {}}>Change join code</button>
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
