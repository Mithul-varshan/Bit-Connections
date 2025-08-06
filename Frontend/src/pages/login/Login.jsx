import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Link,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../api/axios";

const LoginPage = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log("Login response:", res.data);
      const { token, user: userDataFromApi } = res.data;
      
      let role = userDataFromApi.role;
      let category = null;

      if (["cata", "catb", "catc"].includes(role)) {
        category = role.slice(-1).toUpperCase();
        role = "middleman";
      }

      const processedUser = { email: userDataFromApi.email, role, category };
      setUser(processedUser, token);

      if (role === "user") navigate("/user");
      else if (role === "admin") navigate("/admin");
      else if (role === "middleman") navigate("/middleman");
      
    } catch (err) {
      console.log(err);
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{ mt: 1, width: "100%", p: 4, boxShadow: 3, borderRadius: 2 }}
          onSubmit={handleLogin}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>

          {/* This Grid component will now work because it has been imported */}
          <Box sx={{ width: "100%", mt: 1, textAlign: "left" }}>
            <Link href="#" variant="body2">
              Forgot password?
            </Link>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            sx={{ mt: 2 }}
          >
            Sign in with Google
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;