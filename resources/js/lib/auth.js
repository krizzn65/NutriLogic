import api from './api';

const TOKEN_KEY = 'nutrilogic_token';
const USER_KEY = 'nutrilogic_user';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: object, token: string}>}
 */
export async function login(email, password) {
  try {
    const response = await api.post('/login', {
      email,
      password,
    });

    const { user, token } = response.data;

    // Save token and user to localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { user, token };
  } catch (error) {
    // Re-throw error to be handled by caller
    throw error;
  }
}

/**
 * Get stored authentication token
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user data
 * @returns {object|null}
 */
export function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Fetch current user data from API
 * @returns {Promise<object>}
 */
export async function fetchMe() {
  try {
    const response = await api.get('/me');
    const { user } = response.data;

    // Update user data in localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  } catch (error) {
    // If error, clear auth data
    logout();
    throw error;
  }
}

/**
 * Logout user (clear token and user data)
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Logout user and call API to revoke token
 * @returns {Promise<void>}
 */
export async function logoutWithApi() {
  try {
    // Try to revoke token on server
    await api.post('/logout');
  } catch (error) {
    // Even if API call fails, clear local data
    console.error('Logout API error:', error);
  } finally {
    // Always clear local data
    logout();
  }
}

