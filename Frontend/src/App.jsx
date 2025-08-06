import React from 'react';
import useAuthStore from "./store/authStore";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Import MUI components for the Dialog
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

// Your page and layout imports
import Applayout from "./applayout/Applayout";
import Login from "./pages/login/Login";


// 1. The Modal component is simpler now.
function SessionExpiredModal() {
    // It uses a simple hook to get the flag. This hook automatically re-renders the component when the state changes.
    const isSessionExpired = useAuthStore((state) => state.isSessionExpired);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLoginRedirect = () => {
        logout(); // Clear the bad session data
        navigate('/login'); // Redirect to login
    };

    return (
        <Dialog
            open={isSessionExpired}
            aria-labelledby="session-expired-title"
        >
            <DialogTitle id="session-expired-title">{"Session Expired"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Your session has expired. Please log in again to continue.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleLoginRedirect} variant="contained" autoFocus>
                    Login
                </Button>
            </DialogActions>
        </Dialog>
    );
}


// 2. The App component is simpler now.
function App() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  
  // This is still needed to prevent the flicker-on-refresh bug.
  const hasHydrated = useAuthStore.persist.hasHydrated();

  if (!hasHydrated) {
    return null; // Render nothing while waiting for Zustand to load from localStorage.
  }

  // Your routing logic is already correct.
  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/*"
          element={isLoggedIn ? <Applayout /> : <Navigate to="/login" replace />}
        />
      </Routes>
      
      {/* This global modal will now correctly appear when isSessionExpired becomes true. */}
      <SessionExpiredModal />
    </>
  );
}

export default App;