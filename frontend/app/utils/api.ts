import axios, { AxiosError } from 'axios';
import type {AxiosInstance} from "axios";
import { useNavigate } from "react-router";
import routes from '~/constants/routes';


import Storage from '~/utils/storage';

import { apiBaseUrl, SESSION_KEY } from '~/constants/api';

const headers = {
  'Accept-Language': 'en',
  'Content-Type': 'application/json',
};

/*
const createClient = (): AxiosInstance => {
  const client = axios.create({ baseURL: apiBaseUrl, headers });
  client.defaults.headers.common.Authorization = `Token ${Storage.get(
      sessionKey,
  )}`;

  const token = Storage.get(SESSION_KEY);

  return client;
};

const Api = createClient() as AxiosInstance;

// if the user isn't authenticated, remove session key & re-auth
const defaultErrorInterceptor = () => (
  error: AxiosError,
): Promise<AxiosError> => {
  let navigate = useNavigate();
  let location = useLocation();

  console.log('hey', location.pathname);


  console.error(`[response error] [${JSON.stringify(error)}]`);

  let e = error.response;

  if (e && e.status === 401) {
    Storage.remove(AuthSession.sessionKey);
    delete Api.defaults.headers.common.Authorization;

    if (window.location.pathname !== routes.login.link) {
      navigate(`${routes.login.link}?redirect_url=${window.location.pathname}`);
    }
  }

  return Promise.reject(errors);
};

(Api as AxiosInstance).interceptors.response.use(
  (res) => res.data,
  defaultErrorInterceptor(),
);


//const Api = axios.create({ baseURL: apiBaseUrl, headers });*/


// Create Axios client without reading window at import
function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: apiBaseUrl,
    headers: {
      'Accept-Language': 'en',
      'Content-Type': 'application/json',
    }
  });

  // Attach token dynamically on each request
  client.interceptors.request.use((config) => {
    const token = Storage.get(SESSION_KEY);
    console.log('this is the token', token);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle 401 in response
  client.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        Storage.remove(SESSION_KEY);
        // Only redirect in browser
        if (typeof window !== 'undefined' && window.location.pathname !== routes.login.link) {
          window.location.assign(routes.login.link);
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

const Api = createClient();
export default Api;
