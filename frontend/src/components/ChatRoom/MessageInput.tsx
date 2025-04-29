import React, { useState } from 'react';
import axios from '../../axiosConfig';
import { useAppContext, ChatMessage } from '../../context/AppContext';

interface MessageInputProps {
  addMessage: (message: string) => void;
}

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { username, isAdmin, messages, setMessages } = useAppContext();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    try {
      const response = await axios.post('chat/messages/', { content: message });
      if (response.data.success) {
        setMessages([...messages, response.data.message]);
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <form onSubmit={handleSend}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
        required
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default MessageInput;

