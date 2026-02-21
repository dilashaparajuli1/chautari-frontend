import React, { useEffect, useState, useCallback } from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';

import Landing from './pages/Landing';
import DashboardHome from './pages/DashboardHome';
import NewEntry from './pages/NewEntry';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import { api } from './api';

const ROLE_KEY = 'chautari-role';
const USER_KEY = 'chautari-user';
const TOKEN_KEY = 'chautari-token';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const [storedRole] = useState(() => window.localStorage.getItem(ROLE_KEY));
  if (!storedRole) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
};

const RequireRole = ({ role, children }) => {
  const location = useLocation();
  const [storedRole] = useState(() => window.localStorage.getItem(ROLE_KEY));

  if (storedRole !== role) {
    const redirectTo = storedRole === 'admin' ? '/admin' : '/';
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(() => window.localStorage.getItem(ROLE_KEY));
  const [user, setUser] = useState(() => {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(!!window.localStorage.getItem(TOKEN_KEY));

  const { isOpen: isSide, onOpen: onSideOpen, onClose: onSideClose } = useDisclosure();
  const { isOpen: isAuth, onOpen: onAuthOpen, onClose: onAuthClose } = useDisclosure();

  const fetchEntries = useCallback(async () => {
    try {
      const data = await api.entries.list();
      setEntries(data);
    } catch {
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api.users
      .getMe()
      .then((userData) => {
        setUser(userData);
        setUserRole(userData.role);
        window.localStorage.setItem(ROLE_KEY, userData.role);
        window.localStorage.setItem(USER_KEY, JSON.stringify(userData));
        return fetchEntries();
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(ROLE_KEY);
        window.localStorage.removeItem(USER_KEY);
        setUser(null);
        setUserRole(null);
        setEntries([]);
      })
      .finally(() => setLoading(false));
  }, [fetchEntries]);

  const handleLogin = async ({ user: userData, token }) => {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    setUserRole(userData.role);
    window.localStorage.setItem(ROLE_KEY, userData.role);
    const userPayload = {
      email: userData.email,
      name: userData.name || userData.email?.split('@')[0],
      memberSince: userData.memberSince || new Date().toISOString(),
    };
    setUser(userPayload);
    window.localStorage.setItem(USER_KEY, JSON.stringify(userPayload));
    await fetchEntries();
    onAuthClose();
    navigate(userData.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  };

  const handleLogout = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    setUserRole(null);
    window.localStorage.removeItem(ROLE_KEY);
    window.localStorage.removeItem(USER_KEY);
    setEntries([]);
    onSideClose();
    navigate('/', { replace: true });
  };

  const handleAddEntry = async ({ body, chakraId }) => {
    const entry = await api.entries.create(body, chakraId);
    setEntries((prev) => [entry, ...prev]);
    navigate('/dashboard');
  };

  const handleUpdateEntry = async (id, { body, chakraId }) => {
    const updated = await api.entries.update(id, { body, chakraId });
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  };

  const handleDeleteEntry = async (id) => {
    await api.entries.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateUser = async (updates) => {
    const next = await api.users.updateMe(updates);
    setUser((prev) => ({ ...prev, ...next }));
    window.localStorage.setItem(USER_KEY, JSON.stringify(next));
  };

  const showFooter = location.pathname === '/';

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Box>Loading…</Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Header
        isLoggedIn={!!userRole}
        userRole={userRole}
        userName={user?.name || null}
        onAuthOpen={onAuthOpen}
        onSideOpen={onSideOpen}
      />

      <Box as="main" flex="1" pt="80px">
        <Routes>
          <Route path="/" element={<Landing onAuth={onAuthOpen} />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardHome
                  entries={entries}
                  onNewEntry={() => navigate('/new-entry')}
                  onUpdateEntry={handleUpdateEntry}
                  onDeleteEntry={handleDeleteEntry}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/new-entry"
            element={
              <RequireAuth>
                <NewEntry onSave={handleAddEntry} />
              </RequireAuth>
            }
          />
          <Route
            path="/history"
            element={
              <RequireAuth>
                <History
                  entries={entries}
                  onUpdateEntry={handleUpdateEntry}
                  onDeleteEntry={handleDeleteEntry}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile
                  user={user}
                  entries={entries}
                  onUpdateUser={handleUpdateUser}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminDashboard user={user} />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>

      {showFooter && <Footer />}

      <Sidebar isOpen={isSide} onClose={onSideClose} onLogout={handleLogout} userRole={userRole} />

      <AuthModal isOpen={isAuth} onClose={onAuthClose} onLogin={handleLogin} />
    </Box>
  );
}
