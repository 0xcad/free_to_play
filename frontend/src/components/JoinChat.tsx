import React from 'react';
import { useNavigate } from "react-router-dom";
import { useState, useEffect, FormEvent } from 'react';
import axios from '../axiosConfig';
import ActiveUsers from './ActiveUsers';

import { useAppContext } from '../context/AppContext';

const JoinChat: React.FC = () => {
  let navigate = useNavigate();

  const { username, setUsername, fetchUsers } = useAppContext();

  const [inputUsername, setInputUsername] = useState<string>('');

  const joinChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputUsername) return;
    try {
      const response = await axios.post('chat/join/', { 'username': inputUsername });
      if (response.data.success) {
        setUsername(response.data.username);
        //fetchMessages();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error joining chat');
    }
  };

  useEffect(() => {
    if(username)
      navigate("/chat");
  }, [username]);

  useEffect(() => {
    fetchUsers();
  }, []);


  return (
      <div style={{ padding: '20px' }}>
        <h2>Join Chat</h2>
        <ActiveUsers />
        <form onSubmit={joinChat}>
          <input
            type="text"
            placeholder="Enter username"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <button type="submit">Join</button>
        </form>
      </div>
  );
};

export default JoinChat;
