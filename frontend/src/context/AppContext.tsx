import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useNavigate } from "react-router-dom";
import axios from '../axiosConfig';

export type ChatMessage = {
  id: number;
  username: string;
  content: string;
  timestamp: string | null;
};

interface AppState {
  username: string;
  setUsername: (user: string) => void;
  isAdmin: boolean;
  token: string;

  login: (token: string, username: string) => void;
  logout: () => void;

  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  fetchMessages: () => void;
  users: string[];
  setUsers: (users: string[]) => void;
  mutedUsers: string[];
  setMutedUsers: (users: string[]) => void;
  fetchUsers: () => void;

  isKicked: boolean;

  ws: WebSocket | null;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [token, setToken] = useState<string>('');

  const [mutedUsers, setMutedUsers] = useState<string[]>([]);

  const [isKicked, setIsKicked] = useState<boolean>(false);

  // set the token on page load / component mount
  useEffect(() => {
    var t = localStorage.getItem('token');
    if(t) {
      setToken(t);
      setIsAdmin(true);
    }
  }, []);

  //username ref
  const usernameRef = useRef(username);
  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    const rootElement = document.querySelector('body');
    if (isKicked && rootElement) {
      rootElement.classList.add('kicked');
    }

  }, [isKicked]);

  const [ws, setWs] = useState<WebSocket | null>(null);

  // Open the websocket connection when component mounts.
  useEffect(() => {
    // Note: adjust the URL protocol and host as needed (ws:// for HTTP, wss:// for HTTPS)
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/`);
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const currentUser = usernameRef.current;
        console.log(event.data, currentUser);

        if (data.action === 'new_message') {
          setMessages(messages => [...messages, data.message]);
        }
        else if (data.action === 'delete_message') {
          setMessages(messages => messages.filter(m => m.id !== data.message_id));
        }
        else if (data.action === 'kick_user' || data.action === "leave_user")  {
          setUsers(users => users.filter(u => u !== data.username));

          if (data.action === 'kick_user' && data.username === currentUser) {
            setIsKicked(true);
            setUsername('');
          }
        }
        else if (data.action === 'mute_user') {
          setMutedUsers(mutedUsers => [...mutedUsers, data.username]);
        }
        else if (data.action === 'unmute_user') {
          setMutedUsers(mutedUsers => mutedUsers.filter(u => u !== data.username));
        }
        else if (data.action === 'add_user') {
          setUsers(users => [...users, data.username]);
        }
      } catch (error) {
        console.error('Error parsing websocket message:', error);
      }
    };
    setWs(socket);
    return () => {
      socket.close();
    };
  }, []);


  const login = (t: string, username: string) => {
    setIsAdmin(true);
    //setUsername(username);
    localStorage.setItem('token', t);
    setToken(t);
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('token');
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('chat/users/');
      if (response.data.users) {
        setUsers(response.data.users);
      }
      if (response.data.user) {
        setUsername(response.data.user);
      }
      if (response.data.muted_users) {
        setMutedUsers(response.data.muted_users);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get('chat/messages/');
      if (response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const state: AppState = {
    username,
    setUsername,
    isAdmin,
    token,
    login,
    logout,
    messages,
    setMessages,
    fetchMessages,
    users,
    setUsers,
    fetchUsers,
    ws,

    isKicked,
    mutedUsers,
    setMutedUsers,
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
    throw new Error('useAppContext must be used within an AuthProvider');
  }
  return context;
};

