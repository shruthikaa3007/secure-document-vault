import React, { useContext, useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { authAPI } from "../services/api";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the correct endpoint from our API service
        const response = await authAPI.getCurrentUser();
        
        if (response && response.data) {
          setMessage(`Welcome to your dashboard, ${response.data.username}!`);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again later.");
        setMessage("Access denied or server error.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setMessage("Please log in to access your dashboard.");
      setLoading(false);
    }
  }, [user]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Typography variant="body1">{message}</Typography>
      )}
    </Box>
  );
};

export default Dashboard;