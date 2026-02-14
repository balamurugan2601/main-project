import { createContext, useState, useEffect } from "react";
import { checkAuth as checkAuthAPI, logout as logoutAPI } from "../services/api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const userData = await checkAuthAPI();
        setUser(userData);
      } catch (error) {
        // Not authenticated or session expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Real-time access monitoring
  useEffect(() => {
    if (!user) return;

    const monitorSession = async () => {
      try {
        const userData = await checkAuthAPI();

        // Enforce immediate revocation ONLY if rejected
        if (userData.status === 'rejected') {
          setUser(null);
          return;
        }

        // Synchronize role/status changes in real-time
        if (userData.status !== user.status || userData.role !== user.role) {
          setUser(userData);
        }
      } catch (error) {
        // ONLY log out if the error is 401 (Unauthorized)
        // This prevents spontaneous logouts during 500 errors, network timeouts, or backend restarts.
        if (error.response?.status === 401) {
          console.warn('Session invalidated by server. Logging out.');
          setUser(null);
        } else {
          console.log('Heartbeat failed (Transient Error). Retrying on next cycle...');
        }
      }
    };

    const interval = setInterval(monitorSession, 20000); // 20-second heartbeat
    return () => clearInterval(interval);
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

