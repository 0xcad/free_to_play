import axios from 'axios';

//axios.defaults.baseURL = 'http://localhost:8000/api/';
axios.defaults.baseURL = 'http://' + process.env.REACT_APP_BACKEND_ROOT + '/api/';
axios.defaults.withCredentials = true;

/*axios.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');

        // If the token exists, add it to the Authorization header
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);*/

export default axios;
