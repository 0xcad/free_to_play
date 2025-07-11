import type { User } from '~/models/User';

export interface PlayInstance {
  current_player: User | undefined;
  name: string;
  is_debug: bool;
  created: string;
  status: string;
  remaining_time: string | undefined;
  end_time: string | undefined;
  join_code: string;
  inventory: number[];
}

export const defaultPlayInstance = (): PlayInstance => {
  return {
    name: '',
    is_debug: false,
    current_player: undefined,
    created: '',
    status: 'waiting',
    current_game_start: undefined,
    join_code: '',
    inventory: [],
  };
};

