import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AUTH_TOKEN_KEY = 'amarsheba-auth-token';
const CURRENT_USER_KEY = 'amarsheba-current-user';
const ADMIN_EMAIL = 'admin@amarsheba.com';
const AuthContext = createContext(null);

function createAvatar(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'AS'
  );
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    email: user.email?.toLowerCase() || '',
    role: user.email?.toLowerCase() === ADMIN_EMAIL ? 'admin' : user.role || 'citizen',
    avatar: user.avatar || createAvatar(user.name),
  };
}

function readStoredUser() {
  try {
    const value = localStorage.getItem(CURRENT_USER_KEY);
    return value ? sanitizeUser(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}

function storeSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sanitizeUser(user)));
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed.');
  }

  return payload;
}

function mapAuthError(message, fallback = 'invalidCredentials') {
  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('all fields')) {
    return 'required';
  }

  if (normalized.includes('at least 6')) {
    return 'passwordLength';
  }

  if (normalized.includes('already exists')) {
    return normalized.includes('phone') ? 'phoneExists' : 'emailExists';
  }

  if (normalized.includes('not found')) {
    return 'userNotFound';
  }

  if (normalized.includes('invalid email/phone or password')) {
    return 'invalidCredentials';
  }

  if (normalized.includes('token') || normalized.includes('session')) {
    return 'sessionExpired';
  }

  return fallback;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      setCurrentUser(null);
      setIsLoading(false);
      return { ok: false, error: 'sessionExpired' };
    }

    setIsLoading(true);

    try {
      const data = await request('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = sanitizeUser(data.user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      setCurrentUser(user);
      return { ok: true, user };
    } catch (error) {
      logout();
      return { ok: false, error: mapAuthError(error.message, 'sessionExpired') };
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (emailOrPhone, password) => {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          emailOrPhone: emailOrPhone.trim(),
          password,
        }),
      });

      const user = sanitizeUser(data.user);
      storeSession(data.token, user);
      setCurrentUser(user);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: mapAuthError(error.message) };
    }
  }, []);

  const register = useCallback(async (name, email, phone, password) => {
    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });

      return { ok: true, user: sanitizeUser(data.user) };
    } catch (error) {
      return { ok: false, error: mapAuthError(error.message, 'registerFailed') };
    }
  }, []);

  const updateProfile = useCallback(
    ({ name, language }) => {
      const updatedUser = sanitizeUser({
        ...currentUser,
        name: name.trim(),
        avatar: createAvatar(name),
      });

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      localStorage.setItem('amarsheba-locale', language);
      setCurrentUser(updatedUser);
      return { ok: true, user: updatedUser };
    },
    [currentUser],
  );

  const value = useMemo(
    () => ({
      currentUser,
      login,
      register,
      logout,
      loadUser,
      updateProfile,
      isAuthenticated: Boolean(currentUser),
      isLoading,
    }),
    [currentUser, isLoading, loadUser, login, logout, register, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
