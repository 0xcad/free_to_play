export const apiBaseUrl = import.meta.env.API_URL || 'http://127.0.0.1:8000/api/';
export const wsBaseUrl = import.meta.env.API_URL || 'ws://127.0.0.1:8000/ws/notifications/';

export const SESSION_KEY = '__free_to_play__';

// these are constants for the backend django api, after the /api/ root
export const apiUrls = {
  auth: {
    user: 'accounts',
    login: (uid: string, token: string): string => `accounts/login/${uid}/${token}`,
    resend: 'accounts/resend-email',
    create: 'accounts/create',
    join: `accounts/join`,
  },

  chat: {
    list: 'chat/',
    detail: (id: number) : string => `chat/${id}`,
  },

  play: {
    detail: 'play/',
  },
};

