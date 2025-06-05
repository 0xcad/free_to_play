import type { User } from '~/models/User';

export interface PlayInstance {
  current_user: User | undefined;
  name: string;
  is_debug: bool;
  created: string;
  status: string;
  current_game_start: string | undefined;
}
