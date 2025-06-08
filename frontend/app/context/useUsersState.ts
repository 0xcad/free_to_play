import { useState, useEffect } from "react";

import type { User } from '../models/User';
import type { WsState } from "./useWsState";

export interface UsersState {
  users: Record<string, User>;
  setUsers: (users: Record<string, User>) => void;
  addUser: (user: User) => void;
}

export function useUsersState(ws: WsState): ChatState {
  const [users, setUsers] = useState<Record<string, User>>({});

  // function to add/update Users
  const addUser = (user: User) => {
    if (!user) return;
    setMessages((prev) => {
      return { ...prev, [user.id]: user };
    });
    console.log(messages);
  };

  /*// if a websocket comes in with a new chat message, post it
  useEffect(() => {
    ws.registerHandler("chat.ChatMessage.created", createChatMessage);
    ws.registerHandler("chat.ChatMessage.deleted", deleteChatMessage);

    return () => {
      ws.unregisterHandler("chat.ChatMessage.created", createChatMessage);
      ws.unregisterHandler("chat.ChatMessage.deleted", deleteChatMessage);
    };
  }, [ws.registerHandler, ws.unregisterHandler]);*/

  return { users, setUsers, addUser };
}
