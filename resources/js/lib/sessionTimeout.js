// Session timeout configuration
// This module manages the dynamic session timeout set by admin

const SESSION_TIMEOUT_KEY = 'nutrilogic_session_timeout';
const LAST_ACTIVITY_KEY = 'nutrilogic_last_activity';
const MAINTENANCE_MODE_KEY = 'nutrilogic_maintenance_mode';
const DEFAULT_TIMEOUT = 60; // Default 60 minutes

// Get session timeout in minutes (set by admin)
export const getSessionTimeout = () => {
    const timeout = localStorage.getItem(SESSION_TIMEOUT_KEY);
    return timeout ? parseInt(timeout, 10) : DEFAULT_TIMEOUT;
};

// Set session timeout (admin only)
export const setSessionTimeout = (minutes) => {
    localStorage.setItem(SESSION_TIMEOUT_KEY, minutes.toString());
};

// Get maintenance mode status
export const getMaintenanceMode = () => {
    const mode = localStorage.getItem(MAINTENANCE_MODE_KEY);
    return mode === 'true';
};

// Set maintenance mode (admin only)
export const setMaintenanceMode = (enabled) => {
    localStorage.setItem(MAINTENANCE_MODE_KEY, enabled.toString());
};

// Update last activity timestamp
export const updateLastActivity = () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
};

// Get last activity timestamp
export const getLastActivity = () => {
    const activity = localStorage.getItem(LAST_ACTIVITY_KEY);
    return activity ? parseInt(activity, 10) : Date.now();
};

// Check if session has expired
export const isSessionExpired = () => {
    const lastActivity = getLastActivity();
    const timeout = getSessionTimeout();
    const now = Date.now();
    const elapsedMinutes = (now - lastActivity) / (1000 * 60);
    return elapsedMinutes > timeout;
};

// Initialize activity tracking
export const initActivityTracking = () => {
    // Update activity on user interactions
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
        updateLastActivity();
    };

    events.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
    });

    // Set initial activity
    updateLastActivity();

    // Return cleanup function
    return () => {
        events.forEach(event => {
            document.removeEventListener(event, handleActivity);
        });
    };
};
