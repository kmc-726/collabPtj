import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import DashboardPage from './DashboardPage';
import Documents from './Documents';
import type { Member } from '../types';
import { getMe } from '../api/member';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    getMe()
      .then(setMember)
      .catch(() => {
        localStorage.removeItem('accessToken');
        navigate('/login', { replace: true });
      });
  }, []);

  const handleLogout = () => {
    navigate('/login', { replace: true });
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage member={member} />;
      case 'my-docs': return <Documents />;
      default:
        return <div style={{ padding: 32, color: 'var(--color-text-secondary)', fontSize: 14 }}>준비 중인 페이지예요.</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-background-tertiary)' }}>
      <Sidebar member={member} activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />
      <main style={{ marginLeft: 220, flex: 1 }}>
        {renderPage()}
      </main>
    </div>
  );
};

export default MainLayout;
