import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logoutWithApi } from '../../lib/auth';
import {
    getSessionTimeout,
    getLastActivity,
    updateLastActivity,
    initActivityTracking
} from '../../lib/sessionTimeout';

// Session monitor component - checks for inactivity and logs out user
export default function SessionMonitor({ children }) {
    const navigate = useNavigate();
    const checkIntervalRef = useRef(null);
    const user = getUser();

    useEffect(() => {
        // Skip if not authenticated
        if (!user) return;

        // Initialize activity tracking (mouse, keyboard, etc)
        const cleanupActivity = initActivityTracking();

        // Check session expiry every minute
        const checkSession = () => {
            const lastActivity = getLastActivity();
            const timeout = getSessionTimeout();
            const now = Date.now();
            const elapsedMinutes = (now - lastActivity) / (1000 * 60);

            // If session expired due to inactivity
            if (elapsedMinutes >= timeout) {
                // Log out
                logoutWithApi().then(() => {
                    alert(`Sesi Anda telah berakhir karena tidak ada aktivitas selama ${timeout} menit.`);
                    navigate('/auth');
                }).catch(() => {
                    navigate('/auth');
                });
            }
        };

        // Check every 30 seconds
        checkIntervalRef.current = setInterval(checkSession, 30 * 1000);

        // Cleanup
        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            cleanupActivity();
        };
    }, [navigate, user]);

    return children;
}
