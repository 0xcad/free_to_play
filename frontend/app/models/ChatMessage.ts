import type { User } from '~/models/User';

export interface ChatMessage {
  id: number;
  content: string;
  user: User;
  created: string;
}
