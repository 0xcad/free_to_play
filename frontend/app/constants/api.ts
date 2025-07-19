export const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';
export const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/notifications/';
export const frontendBaseUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173/';
export const stripePublicKey = import.meta.env.VITE_STRIPE_PK || 'pk_test_51RmIs54N2pJVojh2VfIJ31bNdQlYjyNjfNlRDMId5DYfdRh1kYxaWMFV8aN42ODaD2v4LqdzHQWDJ837MDqFVesQ00jj9s3ldl';

export const SESSION_KEY = '__free_to_play__';

// these are constants for the backend django api, after the /api/ root
export const apiUrls = {
  accounts: {
    me: 'accounts/me/',
    //login: (uid: string, token: string): string => `accounts/login/${uid}/${token}`,
    login: `accounts/login/`,
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
    start_timer: 'play/timer/start/',
    pause_timer: 'play/timer/pause/',
    reset_timer: 'play/timer/reset/',
  },

  store: {
    buy_gems: 'store/buy-gems/',
    list: 'store/items/',
    detail: (id: string) : string =>  `store/items/${id}/`,
    purchase: (id: string) : string =>  `store/items/${id}/purchase/`,
    inventory: 'store/items/inventory/',
    create_checkout_session: 'store/stripe/create_checkout_session/',
    session_status: (session_id: string) : string => `store/stripe/session_status/${session_id}/`,
  },
};

