import axios, { AxiosError } from 'axios';
import type {AxiosInstance} from "axios";
import { useNavigate } from "react-router";
import routes from '~/constants/routes';

import { toast } from 'react-toastify';

import Storage from '~/utils/storage';

import { apiBaseUrl, SESSION_KEY } from '~/constants/api';

const headers = {
  'Accept-Language': 'en',
  'Content-Type': 'application/json',
};


// Create Axios client without reading window at import
function createClient(useNotifs: boolean): AxiosInstance {
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
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response ) => {
      if (response?.status == 200 && response.data?.details && useNotifs) {
        toast.success(response.data.details);
      }
      return response.data;
    },
    (error: AxiosError) => {
      // Handle 401 in response
      if (error.response?.status === 401) {
        Storage.remove(SESSION_KEY);
        if (useNotifs)
          toast.error('invalid token; being logged out');
        // Only redirect in browser
        if (typeof window !== 'undefined' && window.location.pathname !== routes.join.link) {
          window.location.assign(routes.join.link);
        }
      }


      else if (error.response?.status === 400 && useNotifs) {
        if (error.response.data?.details)
          toast.error(error.response.data?.details);
      }
      else if (error.response?.status === 500 && useNotifs) {
          toast.error('oopsy woopsy. a little fucky wucky occured :(');
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const Api = createClient(true);
export const ApiSilent = createClient(false);
export default Api;
