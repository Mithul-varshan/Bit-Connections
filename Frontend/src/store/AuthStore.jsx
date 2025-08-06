import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      // STATE:
      user: null,         
      token: null,        // State to hold the JWT
      isLoggedIn: false,
      isSessionExpired: false, // State to track session expiration  

      // ACTIONS:
      setUser: (userData, authToken) => set({
        user: userData,
        token: authToken,   // Store the token on login
        isLoggedIn: true,
        isSessionExpired: false, // Make sure this is false on a successful login
      }),
      setSessionExpired: () => set({
        isSessionExpired: true,
      }),  
      logout: () => set({ 
        user: null, 
        token: null,        // Clear the token on logout
        isLoggedIn: false,
        isSessionExpired: false, // Reset session expiration on manual logout  
      }),
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
);

export default useAuthStore;