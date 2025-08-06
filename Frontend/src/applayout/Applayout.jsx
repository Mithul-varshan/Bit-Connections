import React from "react";
import { Box, Toolbar } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from '../store/authStore';

// Import Pages
import Home_user from "../pages/user/Home_user";
import MiddleManHome from '../pages/midddlemanHome/MiddleManHome';
import MiddleManRecords from "../pages/middleManRecords/MiddleManRecords";
import MiniDrawer from "../components/navbar/Navbar"; 

function Applayout() {
  const user = useAuthStore((state) => state.user);
  
  const getDefaultRouteForRole = () => {
      if (!user?.role) return '/login'; 
      switch(user.role) {
          case 'user': return '/user';
          case 'middleman': return '/middleman';
          case 'admin': return '/admin';
          default: return '/login';
      }
  }

  return (
    <Box sx={{ display: "flex" }}>
      <MiniDrawer /> 
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f0efefff',minHeight:'100vh' }}>
        <Toolbar /> 
        <Routes>
          <Route path="/user" element={<Home_user />} />
          <Route path="/middleman" element={<MiddleManHome />} />
          <Route path="/middleman/pending-records" element={<MiddleManRecords />} />
          <Route path="/" element={<Navigate to={getDefaultRouteForRole()} replace />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Box>
    </Box>
  );
}

export default Applayout;