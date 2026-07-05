import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import DashboardPage from '../pages/dashboard/DashboardPage';
import DocumentsPage from '../pages/documents/DocumentsPage';
import ProfilePage from '../pages/profile/ProfilePage';
import ProjectsPage from '../pages/projects/ProjectsPage';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage';
import DocumentListView from '../components/document/DocumentListView';
import NotificationDropdown from '../components/notification/NotificationDropdown';
import type { Member } from '../types';
import { getMe } from '../api/member';
import { logout } from '../api/auth';
import {
  getSharedDocuments, getCodeSnippets,
  getStarredDocuments, getRecentDocuments,
  getReviewDocuments, searchDocuments,
  toggleShare, toggleStar,
} from '../api/document';
import styles from './MainLayout.module.css';

type PageView = 'dashboard' | 'my-docs' | 'shared-docs' | 'recent' | 'starred' | 'snippets' | 'reviews' | 'profile' | 'projects' | 'project-detail';

interface MainLayoutProps {
  onLogout: () => void;
}

const PAGE_TITLES: Record<PageView, string> = {
  dashboard:        '대시보드',
  'my-docs':        '내 문서',
  'shared-docs':    '공유 문서',
  recent:           '최근 열람',
  starred:          '즐겨찾기',
  snippets:         '코드 스니펫',
  reviews:          '리뷰 요청',
  profile:          '설정',
  projects:         '내 프로젝트',
  'project-detail': '프로젝트',
};

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [activePage, setActivePage] = useState<PageView>('dashboard');
  const [initialDocId, setInitialDocId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    getMe().then(setMember).catch(() => {
      onLogout();
      navigate('/login', { replace: true });
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    onLogout();
    navigate('/login', { replace: true });
  };

  const handleNavigate = (page: string, documentId?: string) => {
    setActivePage(page as PageView);
    if (documentId) setInitialDocId(documentId);
  };

  const handleOpenDocument = (id: string) => {
    setInitialDocId(id);
    setActivePage('my-docs');
  };

  const handleSearchSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) setIsSearching(true);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const renderPage = () => {
    const userId = member?.userId ?? '';

    switch (activePage) {
      case 'dashboard':
        return <DashboardPage member={member} onNavigate={handleNavigate} />;

      case 'my-docs':
        return (
          <DocumentsPage
            currentUserId={userId}
            currentNickname={member?.nickname ?? ''}
            initialDocId={initialDocId}
            onDocOpened={() => setInitialDocId(null)}
          />
        );

      case 'shared-docs':
        return (
          <DocumentListView
            key="shared-docs"
            title="공유 문서"
            subtitle="공개된 모든 문서를 볼 수 있어요."
            fetchFn={getSharedDocuments}
            currentUserId={userId}
            onOpenDocument={handleOpenDocument}
            onToggleShare={toggleShare}
            onToggleStar={toggleStar}
            emptyMessage="공유된 문서가 없어요."
            showOwner
          />
        );

      case 'recent':
        return (
          <DocumentListView
            key="recent"
            title="최근 열람"
            subtitle="최근에 수정한 문서 목록이에요."
            fetchFn={getRecentDocuments}
            currentUserId={userId}
            onOpenDocument={handleOpenDocument}
            onToggleShare={toggleShare}
            onToggleStar={toggleStar}
            emptyMessage="최근 열람한 문서가 없어요."
          />
        );

      case 'starred':
        return (
          <DocumentListView
            key="starred"
            title="즐겨찾기"
            subtitle="즐겨찾기한 문서만 모아볼 수 있어요."
            fetchFn={getStarredDocuments}
            currentUserId={userId}
            onOpenDocument={handleOpenDocument}
            onToggleShare={toggleShare}
            onToggleStar={toggleStar}
            emptyMessage="즐겨찾기한 문서가 없어요. 내 문서 편집 화면에서 ★ 버튼을 눌러보세요!"
          />
        );

      case 'snippets':
        return (
          <DocumentListView
            key="snippets"
            title="코드 스니펫"
            subtitle="'code' 태그가 달린 문서만 모아볼 수 있어요."
            fetchFn={getCodeSnippets}
            currentUserId={userId}
            onOpenDocument={handleOpenDocument}
            onToggleShare={toggleShare}
            onToggleStar={toggleStar}
            emptyMessage="코드 스니펫이 없어요. 문서 태그에 'code'를 추가해 보세요!"
          />
        );

      case 'reviews':
        return (
          <DocumentListView
            key="reviews"
            title="리뷰 요청"
            subtitle="공유된 내 문서 중 미해결 댓글이 있는 문서예요."
            fetchFn={getReviewDocuments}
            currentUserId={userId}
            onOpenDocument={handleOpenDocument}
            onToggleShare={toggleShare}
            onToggleStar={toggleStar}
            emptyMessage="미해결 리뷰 요청이 없어요."
          />
        );

      case 'profile':
        return <ProfilePage onLogout={handleLogout} />;

      case 'projects':
        return (
          <ProjectsPage
            currentUserId={userId}
            onOpenProject={(id) => {
              setSelectedProjectId(id);
              setActivePage('project-detail');
            }}
          />
        );

      case 'project-detail':
        return selectedProjectId ? (
          <ProjectDetailPage
            projectId={selectedProjectId}
            currentUserId={userId}
            onBack={() => setActivePage('projects')}
            onOpenDocument={(id) => {
              setInitialDocId(id);
              setActivePage('my-docs');
            }}
            onDeleted={() => {
              setSelectedProjectId(null);
              setActivePage('projects');
            }}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        member={member}
        activePage={activePage}
        onNavigate={(p) => { setActivePage(p as PageView); handleSearchClear(); }}
        onLogout={handleLogout}
      />

      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.pageTitle}>
            {isSearching ? '검색 결과' : PAGE_TITLES[activePage]}
          </span>

          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <div className={styles.searchWrapper}>
              <i className={`ti ti-search ${styles.searchIcon}`} aria-hidden="true" />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="문서 검색... (Enter)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) setIsSearching(false);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={handleSearchClear}
                >
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              )}
            </div>
          </form>

          <div className={styles.headerActions}>
            <NotificationDropdown
              userId={member?.userId ?? ''}
              onNavigateDocument={(docId) => handleNavigate('my-docs', docId)}
            />
          </div>
        </header>

        <main className={styles.main}>
          {isSearching ? (
            <DocumentListView
              title={`"${searchQuery}" 검색 결과`}
              subtitle="제목·내용에서 검색한 결과예요."
              fetchFn={() => searchDocuments(searchQuery)}
              currentUserId={member?.userId ?? ''}
              onOpenDocument={handleOpenDocument}
              onToggleShare={toggleShare}
              onToggleStar={toggleStar}
              emptyMessage="검색 결과가 없어요."
              showOwner
            />
          ) : (
            renderPage()
          )}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
