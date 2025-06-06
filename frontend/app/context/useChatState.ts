import { useState } from "react";

import type { ChatMessage } from '../models/ChatMessage';
import type { WsState } from "./useWsState";

export interface ChatState {
  messages: ChatMessage[];
  setMessages: (msgs: ChatMessage[]) => void;
}

export function useChatState(ws: WsState): ChatState {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  return { messages, setMessages };
}
