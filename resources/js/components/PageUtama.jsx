import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OrangTua from "./OrangTua";
import Kader from "./Kader";
import { getUser, isAuthenticated } from "../lib/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/auth');
      return;
    }

    // Get user data from localStorage
    const userData = getUser();
    if (!userData) {
      navigate('/auth');
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <motion.div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#666'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        Loading...
      </motion.div>
    );
  }

  // Render based on user role
  if (user?.role === 'kader' || user?.role === 'admin') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Kader />
      </motion.div>
    );
  }
  
  // Default to OrangTua (for role 'ibu' or any other role)
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <OrangTua />
    </motion.div>
  );
}
