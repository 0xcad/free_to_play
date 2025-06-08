import { useState, useEffect } from "react";

import type { ChatMessage } from '../models/ChatMessage';
import type { WsState } from "./useWsState";

export interface ChatState {
  messages: Record<string, ChatMessage>;
  setMessages: (msgs: Record<string, ChatMessage>) => void;
  addChatMessage: (msgs: ChatMessage) => void;
  removeChatMessage: (msgId: string) => void;
}

export function useChatState(ws: WsState): ChatState {
  const [messages, setMessages] = useState<Record<string, ChatMessage>>({});

  // function to create chat messages
  const addChatMessage = (msg: ChatMessage) => {
    if (!msg) return;
    setMessages((prev) => {
      if (prev[msg.id]) return prev;
      return { ...prev, [msg.id]: msg };
    });
    console.log(messages);
  };

  const removeChatMessage = (messageId : string) => {
    setMessages((prev) => {
      const updated = { ...prev };
      delete updated[messageId];
      return updated;
    });
  }

  // if a websocket comes in with a new chat message, post it
  useEffect(() => {
    ws.registerHandler("chat.ChatMessage.created", addChatMessage);
    ws.registerHandler("chat.ChatMessage.deleted", removeChatMessage);

    return () => {
      ws.unregisterHandler("chat.ChatMessage.created", addChatMessage);
      ws.unregisterHandler("chat.ChatMessage.deleted", removeChatMessage);
    };
  }, [ws.registerHandler, ws.unregisterHandler]);

  return { messages, setMessages, addChatMessage, removeChatMessage };
}
