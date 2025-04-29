import React, { useState, useEffect } from 'react';
import MessageInput from './MessageInput';
import axios from '../../axiosConfig';
import ActiveUsers from '../ActiveUsers';

import { useNavigate } from "react-router-dom";

import { useAppContext, ChatMessage } from '../../context/AppContext';

const ChatRoom: React.FC = () => {
  let navigate = useNavigate();
  const { username, isAdmin, messages, setUsername, setMessages, token, users, fetchUsers, fetchMessages } = useAppContext();

  useEffect(() => {
    fetchUsers();
    fetchMessages();
  }, []);

  useEffect(() => {
    if(!username)
      navigate("/");
  }, [username]);

  const leaveChat = async () => {
    try {
      const response = await axios.post('chat/leave/');
      if (response.data.success) {
        setUsername('');
        setMessages([]);
      }
    } catch (err: any) {
      navigate("/");
    }
  };

  // delete a message
  const deleteMessage = async (id : number) => {
    try {
      const response = await axios.post(`chat/delete_message/${id}/`, {},
                { headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
      if (response.data.success) {
        setMessages(messages.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Error deleting message', error);
    }
  };

  return (
    <div>
      <div>
        <h1>Chat Room | {username}</h1>
        <button onClick={leaveChat}>Leave Chat</button>
        <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
          {messages.map((msg : ChatMessage) => (
            <div key={msg.id} style={{ marginBottom: '10px' }}>
              <strong>{msg.username}: </strong>
              {msg.content}
              {isAdmin && (
              <button onClick={() => {deleteMessage(msg.id)}} style={{ marginLeft: '10px' }}>
                Delete
              </button>
              )}
            </div>
          ))}
        </div>
        <MessageInput />
      </div>
      <ActiveUsers />
    </div>
  );
};

export default ChatRoom;

