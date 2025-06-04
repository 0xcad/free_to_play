export const apiBaseUrl = import.meta.env.API_URL || 'http://127.0.0.1:8000/api/';

export const SESSION_KEY = '__free_to_play__';

// TODO:
// these are constants for the backend django api, after the /api/ root
export const apiUrls = {
  auth: {
    user: 'accounts',
    login: (uid: string, token: string): string => `accounts/login/${uid}/${token}`,
    resend: 'accounts/resend-email',
    create: 'accounts/create',
  },
};

