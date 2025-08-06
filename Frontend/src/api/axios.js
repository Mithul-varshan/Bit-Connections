// src/api/axios.js

import axios from 'axios';
import useAuthStore from '../store/authStore';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
});

// PART 1: The Request Interceptor (Adds the token) - This part is correct.
axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


// PART 2: The Response Interceptor (Handles Expired Tokens) - THIS IS THE FIX.
axiosInstance.interceptors.response.use(
    // Successful responses are passed through.
    (response) => response,

    (error) => {
        // We only care about errors that have a response from the server.
        if (error.response) {
            // Check for the specific 401 or 403 status codes.
            if (error.response.status === 401 || error.response.status === 403) {
                // Get the current state of the store
                const { isSessionExpired, setSessionExpired } = useAuthStore.getState();

                // To prevent multiple modals, only trigger if one isn't already active.
                if (!isSessionExpired) {
                    console.log('Session expired, triggering modal.');
                    // This directly updates the store, which our App component will listen to.
                    setSessionExpired();
                }
            }
        }
        
        // This is crucial: we must still pass the error along, so the original
        // component that made the API call knows that it failed.
        return Promise.reject(error);
    }
);


export default axiosInstance;