import { useState, useEffect } from "react";

import type { User } from '../models/User';
import type { WsState } from "./useWsState";

import routes from '~/constants/routes';
import { useNavigate } from "react-router";
import { toast } from 'react-toastify';

export interface UsersState {
  users: Record<string, User>;
  setUsers: (users: Record<string, User>) => void;
  addUser: (user: User) => void;
  removeUser: (user_id: string) => void;
  updateUser: (user: User) => void;
}

export function useUsersState(
  ws: WsState, currentUser : User,
  setCurrentUser: (user: User | undefined) => void,
): ChatState {
  let navigate = useNavigate();
  const [users, setUsers] = useState<Record<string, User>>({});

  // function to add/update Users
  const addUser = (user: User) => {
    if (!user) return;
    setUsers((prev) => {
      return { ...prev, [user.id]: user };
    });
  };

  const removeUser = (user_id: string) => {
    if (!user_id) return;
    setUsers((prev) => {
      const updated = { ...prev };
      delete updated[user_id];
      return updated;
      return { ...prev, [user.id]: user };
    });
  };

  const updateUser = (user: User) => {
    if (!user) return;
    var updated_user = users[user.id];
    setUsers((prev) => {
      return { ...prev, [user.id]: { ...updated_user, ...user }};
    });
    if (currentUser && currentUser.id === user.id) {
      setCurrentUser({ ...currentUser, ...user });
    }
  }

  const userKicked = (data) => {
    var user_id = data.user_id;
    // if the current user is kicked, redirect to the login page
    if (currentUser && currentUser.id == user_id) {
      toast.error("You have been kicked from the game!!");
      navigate(routes.join.link);
    } else {
      removeUser(user_id);
    }
  }

  const userMuted = (data) => {
    console.log('hey', data);
    var muted = data.muted;
    var user_id = data.user_id;
    if (currentUser && currentUser.id == user_id) {
      if (muted === false) {
        toast.info("you've been unmuted");
        setCurrentUser({ ...currentUser, is_muted: false });
      }
      else {
        toast.error("you've been muted");
        setCurrentUser({ ...currentUser, is_muted: true });
      }
    }
    setUsers((prev) => {
      const updated = { ...prev };
      if (updated[user_id]) {
        updated[user_id].is_muted = !!muted;
      }
      return updated;
    });
  }

  // if a websocket comes in with a new chat message, post it
  useEffect(() => {
    ws.registerHandler("accounts.User.kicked", userKicked);
    ws.registerHandler("accounts.User.muted", userMuted);
    ws.registerHandler("accounts.User.joined", addUser);

    return () => {
      ws.unregisterHandler("accounts.User.kicked", userKicked);
      ws.unregisterHandler("accounts.User.muted", userMuted);
      ws.unregisterHandler("accounts.User.joined", addUser);
    };
  }, [ws.registerHandler, ws.unregisterHandler]);

  return { users, setUsers, addUser, removeUser, updateUser };
}
