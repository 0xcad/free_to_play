import type { User } from '~/models/User';

export interface PlayInstance {
  current_player: User | undefined;
  status: string;
  join_code: string;
  stream_url: string;
  freelance_score: number;
}

export const defaultPlayInstance = (): PlayInstance => {
  return {
    current_player: undefined,
    status: 'waiting',
    join_code: '',
    stream_url: '',
    freelance_score: 0,
  };
};

