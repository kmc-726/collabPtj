import React from 'react';
import type { Member } from '../../types';
import styles from './Sidebar.module.css';

interface NavItem {
  icon: string;
  label: string;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  member: Member | null;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const NavRow: React.FC<NavItem> = ({ icon, label, badge, active, onClick }) => (
  <div
    className={`${styles.navRow} ${active ? styles.active : ''}`}
    onClick={onClick}
  >
    <i className={`ti ti-${icon} ${styles.navIcon}`} aria-hidden="true" />
    <span className={styles.navLabel}>{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className={styles.navBadge}>{badge}</span>
    )}
  </div>
);

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className={styles.sectionLabel}>{label}</div>
);

const Sidebar: React.FC<SidebarProps> = ({ member, activePage, onNavigate, onLogout }) => {
  const initials = member?.nickname ? member.nickname.charAt(0).toUpperCase() : '?';

  return (
    <aside className={styles.sidebar}>
      {/* 로고 */}
      <div className={styles.logo} onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
        <div className={styles.logoIcon}>
          <i className="ti ti-stack-2" aria-hidden="true" />
        </div>
        <span className={styles.logoText}>Collab</span>
      </div>

      {/* 네비게이션 */}
      <nav className={styles.nav}>
        {/* <NavRow
          icon="layout-dashboard"
          label="대시보드"
          active={activePage === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        /> */}

        <SectionLabel label="문서" />
        <NavRow icon="file-text"  label="내 문서"    active={activePage === 'my-docs'}     onClick={() => onNavigate('my-docs')} />
        <NavRow icon="users"      label="공유 문서"   active={activePage === 'shared-docs'} onClick={() => onNavigate('shared-docs')} />
        <NavRow icon="clock"      label="최근 열람"   active={activePage === 'recent'}      onClick={() => onNavigate('recent')} />
        <NavRow icon="star"       label="즐겨찾기"    active={activePage === 'starred'}     onClick={() => onNavigate('starred')} />

        <SectionLabel label="협업" />
        <NavRow icon="layout-grid" label="내 프로젝트" active={activePage === 'projects' || activePage === 'project-detail'} onClick={() => onNavigate('projects')} />

        <SectionLabel label="개발" />
        <NavRow icon="code"       label="코드 스니펫" active={activePage === 'snippets'}    onClick={() => onNavigate('snippets')} />
        <NavRow icon="git-branch" label="리뷰 요청"   active={activePage === 'reviews'}     onClick={() => onNavigate('reviews')} />

        <SectionLabel label="계정" />
        <NavRow icon="settings"   label="설정"        active={activePage === 'profile'}     onClick={() => onNavigate('profile')} />
      </nav>

      {/* 유저 프로필 */}
      <div className={styles.profile}>
        <div className={styles.profileInner}>
          {member?.profileImageUrl ? (
            <img
              src={member.profileImageUrl}
              alt={member.name}
              className={styles.avatarImg}
            />
          ) : (
            <div className={styles.avatar}>{initials}</div>
          )}
          <div className={styles.userInfo}>
            <div className={styles.userName}>{member?.nickname ?? '...'}</div>
            <div className={styles.userRole}>
              {member?.role === 'ROLE_ADMIN' ? '관리자' : '멤버'}
            </div>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={onLogout}
            title="로그아웃"
          >
            <i className="ti ti-logout" aria-hidden="true" />로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
