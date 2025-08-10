import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';

import type { ChatMessage } from '~/models/ChatMessage';
import Message from './Message';
import Icon from '~/components/shared/Icon';

import './Chat.css';

interface PaginatedResponse {
  results: ChatMessage[];
  prev: string | null;
}


interface ChatProps {
  kickUser?: (user_id: string) => void;
  muteUser?: (user_id: string) => void;
  deleteChatMessage?: (message_id: string) => void;
}
/*interface ChatProps {
  messages: Record<string, ChatMessage>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, ChatMessage>>>;
}

const Chat: React.FC<ChatProps> = ({ messages, setMessages }) => {
  const { ws } = useAppContext();*/
const Chat: React.FC<ChatProps> = ({kickUser, muteUser, deleteChatMessage }) => {
  const { ws, chat, currentUser, users } = useAppContext();

  const [prevLink, setPrevLink] = useState<string | null>(null); // prev link with cursor pagination
  const [inputText, setInputText] = useState('');
  const containerRef = useRef<HTMLUListElement>(null);

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
    chat.addChatMessage(optimisticMsg);
    setInputText('');

    try {
      var newMsg = await Api.post(apiUrls.chat.create, {content: inputText});
      chat.addChatMessage(newMsg);
      // remove optimistic placeholder
      chat.removeChatMessage(tempId);
    } catch (err) {
      chat.removeChatMessage(tempId);
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!prevLink) return;
    try {
      const data = await Api.get<PaginatedResponse>(prevLink);
      data.results.forEach((m) => chat.addChatMessage(m));
      setPrevLink(data.next);
    } catch (error) {
      console.log(error);
      toast.error('Failed to load more messages.');
    }
  };

  if (!currentUser)
    return (<p>Loading current user...</p>);

  return (
    <div className='chat-container'>
      {prevLink && (
        <button
          onClick={loadMoreMessages}
          className="button"
        >
          {prevLink ? 'Load Older Messages' : 'No More Messages'}
        </button>
      )}
      <ul
        ref={containerRef}
        className="chat-messages"
      >
        {Object.values(chat.messages)
          .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
          .map((msg) => (
            <li key={msg.id} className="chat-message font-alt">
              <Message key={msg.id} message={msg} currentUser={currentUser} />
              {msg.user.id != currentUser.id && kickUser && (<button onClick={() => {kickUser(msg.user.id)}}>kick user</button>)}
              {msg.user.id != currentUser.id && muteUser && !users.users[msg.user.id]?.is_muted && (<button onClick={() => {muteUser(msg.user.id, true)}}>mute user</button>)}
              {deleteChatMessage && (<button onClick={() => {deleteChatMessage(msg.id)}}>delete message</button>)}
            </li>
          ))}
      </ul>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={currentUser.is_muted ? "You've been muted..." : "Type a message..."}
        />
        <button
          type="submit"
        >
        <Icon icon="send"/>
        </button>
      </form>
    </div>
  );
};

export default Chat;
