import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Storage from '../utils/storage';
import { SESSION_KEY } from '../constants/api';
import { useNavigate } from "react-router";
import routes from '../constants/routes';

import Api from '../utils/api';
import { apiUrls } from '../constants/api';

import type { User } from '~/models/User';
import { useWsState } from "./useWsState";
import { useChatState } from "./useChatState";
import { usePlayState } from "./usePlayState";
import { useStoreState } from "./useStoreState";
import { useUsersState } from "./useUsersState";

import type { WsState } from "./useWsState";
import type { ChatState } from "./useChatState";
import type { PlayState } from "./usePlayState";
import type { StoreState } from "./useStoreState";
import type { UsersState } from "./useStoreState";

import { toast } from 'react-toastify';

type WsHandler = (payload: any) => void;

interface AppState {
  setToken: (string) => void;

  currentUser: User | undefined;
  setCurrentUser: (user: User | undefined) => void;

  ws: WsState;
  play: PlayState;
  chat: ChatState;
  store: StoreState;
  users: UsersState;

  /*logout: () => void;

  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  fetchMessages: () => void;
  users: string[];
  setUsers: (users: string[]) => void;
  mutedUsers: string[];
  setMutedUsers: (users: string[]) => void;
  fetchUsers: () => void;

  isKicked: boolean;

  ws: WebSocket | null;*/
}

const parseJwt = (token:string) => {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let navigate = useNavigate();

  const [token, setToken] = useState<string>(Storage.get(SESSION_KEY));
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

  const ws = useWsState();
  const play = usePlayState(ws, currentUser);
  const chat = useChatState(ws);
  const store = useStoreState(ws);
  const users = useUsersState(ws, currentUser, setCurrentUser);


  // get the current user & refresh their access token
  const getUser = async (): Promise<void> => {
    try {
        var response = await Api.get(apiUrls.play.detail);
        setToken(response.access);
        setCurrentUser(response.user as User);
        play.setPlayInstance(response.play_instance);

        // set the users data
        const dict: Record<string, User> = {};
        response.users.forEach((m) => { dict[m.id] = m; });
        users.setUsers(dict);
      } catch (err) {
        console.log('this is the user login error we get', err);
      }
  };

  // TOKEN UPDATE LOGIC
  // TODO:
  // login flow with refresh / what happens when token changes on another form...
  // maybe use a useRef?
  useEffect(() => {
    console.log('the current token is', token);

    if (!token) {
      if (!currentUser && !(window.location.pathname === routes.verify.link || window.location.pathname == routes.join.link)) {
        // TODO: skip this, and just get protected routes
        toast.error('you need to log in again. no token, and no user');
        navigate(routes.join.link);
      }
      return;
    }

    // we get a token, and whatever we had before as the session key was different
    if (Storage.get(SESSION_KEY) !== token) {
      console.log('updating token', token);
      Storage.set(SESSION_KEY, token);
    }

    // we get a token, the user is logged in
    // check to make sure it hasn't expired
    if (currentUser?.is_authenticated) {
      const parsedToken = parseJwt(token);
      try {
        const expTimestamp = parsedToken.exp;
        if (Date.now() > expTimestamp * 1000) {
          console.log('login expired');
          Storage.remove(SESSION_KEY);
          setToken('');
          navigate(routes.join.link);
        }
      }
      catch (err) {
        console.log('this is the token error we get', err);
        Storage.remove(SESSION_KEY);
        setToken('');
        navigate(routes.join.link);
      }
    }

    // we get a token, the user hasn't logged in
    // get the current user from the backend
    if (!currentUser?.is_authenticated
        && window.location.pathname != routes.verify.link) {
      getUser();
    }
  }, [token]);


  const state: AppState = {
    setToken,
    currentUser, setCurrentUser,
    ws,
    play,
    chat,
    store,
    users,
  };

  return (
    <AppContext.Provider value={ state }>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContext.Provider');
  }
  return context;
};
