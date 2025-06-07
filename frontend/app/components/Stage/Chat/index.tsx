import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';

import type { ChatMessage } from '~/models/ChatMessage';
import Message from './Message';

interface PaginatedResponse {
  results: ChatMessage[];
  prev: string | null;
}

/*interface ChatProps {
  messages: Record<string, ChatMessage>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, ChatMessage>>>;
}

const Chat: React.FC<ChatProps> = ({ messages, setMessages }) => {
  const { ws } = useAppContext();*/
const Chat: React.FC = () => {
  const { ws, chat, currentUser } = useAppContext();

  const [prevLink, setPrevLink] = useState<string | null>(null); // prev link with cursor pagination
  const [inputText, setInputText] = useState('');
  const containerRef = useRef<HTMLUListElement>(null);

  // function to create chat messages
  const createChatMessage = (msg: ChatMessage) => {
    if (!msg) return;
    chat.setMessages((prev) => {
      if (prev[msg.id]) return prev;
      return { ...prev, [msg.id]: msg };
    });
  };

  // if a websocket comes in with a new chat message, post it
  useEffect(() => {
    ws.registerHandler("chat.ChatMessage.created", createChatMessage);

    return () => {
      ws.unregisterHandler("chat.ChatMessage.created", createChatMessage);
    };
  }, [ws.registerHandler, ws.unregisterHandler]);

  //get messages on page load
  useEffect(() => {
    const initialLoad = async () => {
      try {
        const response = await Api.get<PaginatedResponse>(apiUrls.chat.list);
        // populate dictionary
        const dict: Record<string, ChatMessage> = {};
        response.results.forEach((m) => { dict[m.id] = m; });
        chat.setMessages(dict);
        setPrevLink(response.next);
      } catch (error) {
        console.log(error);
        toast.error('Failed to load messages.');
      }
    }
    initialLoad();
  }, [chat.setMessages]);

  // scroll to bottom when messages appear
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chat.messages]);

  const deleteMessage = (messageId : string) => {
    chat.setMessages((prev) => {
      const updated = { ...prev };
      delete updated[messageId];
      return updated;
    });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    // use an optimistic message immediately on submit
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      content: inputText,
      user: currentUser,
      created: new Date().toISOString(),
    } as ChatMessage;
    createChatMessage(optimisticMsg);
    setInputText('');

    try {
      var newMsg = await Api.post(apiUrls.chat.create, {content: inputText});
      createChatMessage(newMsg);
      // remove optimistic placeholder
      deleteMessage(tempId);
    } catch (err) {
      deleteMessage(tempId);
      console.log('this is the error we get', err);
      toast.error('Failed to send message.');
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!prevLink) return;
    try {
      const data = await Api.get<PaginatedResponse>(prevLink);
      data.results.forEach((m) => createChatMessage(m));
      setPrevLink(data.next);
    } catch (error) {
      toast.error('Failed to load more messages.');
    }
  };

  return (
    <div>
      <button
        onClick={loadMoreMessages}
        disabled={!prevLink}
      >
        {prevLink ? 'Load More' : 'No More Messages'}
      </button>
      <ul
        ref={containerRef}
      >
        {Object.values(chat.messages)
          .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
          .map((msg) => (
            <Message key={msg.id} message={msg} currentUser={currentUser} />
          ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
