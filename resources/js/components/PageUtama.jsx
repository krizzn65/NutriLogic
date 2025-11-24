import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Render based on user role
  if (user?.role === 'kader' || user?.role === 'admin') {
    return <Kader />;
  }
  
  // Default to OrangTua (for role 'ibu' or any other role)
  return <OrangTua />;
}
