import type { User } from '~/models/User';

export interface ChatMessage {
  id: number;
  content: string;
  user_id: number;
  created: string;
  read_aloud?: boolean;
  system?: boolean;
}
