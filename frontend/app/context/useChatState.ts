import { useState } from "react";

import type { ChatMessage } from '../models/ChatMessage';
import type { WsState } from "./useWsState";

export interface ChatState {
  messages: ChatMessage[];
  messages: Record<string, ChatMessage>;
  setMessages: (msgs: Record<string, ChatMessage>) => void;
}

export function useChatState(ws: WsState): ChatState {
  const [messages, setMessages] = useState<Record<string, ChatMessage>>({});

  return { messages, setMessages };
}
