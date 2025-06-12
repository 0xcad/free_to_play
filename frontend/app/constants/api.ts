export const apiBaseUrl = import.meta.env.API_URL || 'http://127.0.0.1:8000/api/';
export const wsBaseUrl = import.meta.env.API_URL || 'ws://127.0.0.1:8000/ws/notifications/';

export const SESSION_KEY = '__free_to_play__';

// these are constants for the backend django api, after the /api/ root
export const apiUrls = {
  accounts: {
    me: 'accounts/me/',
    login: (uid: string, token: string): string => `accounts/login/${uid}/${token}`,
    logout: 'accounts/logout/',
    resend: 'accounts/resend_email/',

    create: 'accounts/',
    update: (id: string) : string => `accounts/${id}/`,
    detail: (id: string) : string => `accounts/${id}/`,
    mute: (id: string) : string => `accounts/${id}/mute/`,
  },

  chat: {
    list: 'chat/',
    create: 'chat/',
    kick: 'chat/kick/',
    detail: (id: string) : string => `chat/${id}/`,
    delete: (id: string) : string => `chat/${id}/`,
  },

  play: {
    detail: 'play/',
    update: 'play/update/',
    join: `play/join/`,
    select_player: 'play/select_player/',
  },
};

