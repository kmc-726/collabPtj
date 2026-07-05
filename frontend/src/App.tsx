import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import FindIdPage from './pages/auth/FindIdPage';
import FindPasswordPage from './pages/auth/FindPasswordPage';
import MainLayout from './layouts/MainLayout';
import { initAuth } from './api/auth';
import { setAccessToken } from './api/authToken';
import './App.css';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const hasSession = sessionStorage.getItem('hasSession');
    return hasSession ? 'loading' : 'unauthenticated';
  });

  useEffect(() => {
    if (authState !== 'loading') return;
    initAuth().then((ok) => {
      if (ok) {
        setAuthState('authenticated');
      } else {
        sessionStorage.removeItem('hasSession');
        setAuthState('unauthenticated');
      }
    });
  }, []);

  const handleLoginSuccess = () => {
    sessionStorage.setItem('hasSession', 'true');
    setAuthState('authenticated');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hasSession');
    setAuthState('unauthenticated');
  };

  if (authState === 'loading') {
    return (
      <div className="loadingScreen">
        <div className="loadingText">로딩 중...</div>
      </div>
    );
  }

  const isAuthenticated = authState === 'authenticated';

  const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;

  const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage onLoginSuccess={handleLoginSuccess} /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
        <Route path="/find-id" element={<PublicRoute><FindIdPage /></PublicRoute>} />
        <Route path="/find-password" element={<PublicRoute><FindPasswordPage /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><MainLayout onLogout={handleLogout} /></PrivateRoute>} />
        <Route path="/oauth2/redirect" element={<OAuth2Redirect onSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const OAuth2Redirect: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('accessToken');
  if (token) {
    setAccessToken(token);
    onSuccess();
  }
  return <Navigate to="/dashboard" replace />;
};

export default App;
