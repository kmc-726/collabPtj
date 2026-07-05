import React, { useEffect, useRef, useState } from 'react';
import type { Member } from '../../types';
import { getMe, updateProfile, changePassword, deleteAccount } from '../../api/member';
import { logout } from '../../api/auth';
import styles from './ProfilePage.module.css';

interface ProfilePageProps {
  onLogout: () => void;
}

type Tab = 'info' | 'password' | 'delete';

const resizeImage = (file: File, maxSize = 200): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width, h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = url;
  });

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [member, setMember] = useState<Member | null>(null);
  const [nickname, setNickname] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getMe().then((m) => {
      setMember(m);
      setNickname(m.nickname);
      setProfileImageUrl(m.profileImageUrl ?? '');
      setImagePreview(m.profileImageUrl ?? '');
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImage(file);
    setImagePreview(dataUrl);
    setProfileImageUrl(dataUrl);
  };

  const handleProfileSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    setProfileError('');
    try {
      const updated = await updateProfile({ nickname, profileImageUrl });
      setMember(updated);
      setProfileMsg('프로필이 저장되었습니다.');
    } catch (err: any) {
      setProfileError(err.response?.data?.message ?? '저장에 실패했습니다.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwError(''); setPwMsg('');
    if (newPassword !== newPasswordConfirm) {
      setPwError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword, newPassword, newPasswordConfirm });
      setPwMsg('비밀번호가 변경되었습니다.');
      setCurrentPassword(''); setNewPassword(''); setNewPasswordConfirm('');
    } catch (err: any) {
      setPwError(err.response?.data?.message ?? '비밀번호 변경에 실패했습니다.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) return;
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      await logout();
      onLogout();
    } catch (err: any) {
      alert(err.response?.data?.message ?? '회원 탈퇴에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const initials = member?.nickname?.charAt(0)?.toUpperCase() ?? '?';

  const tabs: { key: Tab; label: string; icon: string; hidden?: boolean }[] = [
    { key: 'info',     label: '기본 정보',     icon: 'ti-user' },
    { key: 'password', label: '비밀번호 변경', icon: 'ti-lock', hidden: !!member?.provider },
    { key: 'delete',   label: '회원 탈퇴',     icon: 'ti-trash' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.tabNav}>
        {tabs.filter((t) => !t.hidden).map((t) => (
          <button
            key={t.key}
            className={`${styles.tabBtn} ${activeTab === t.key ? styles.tabActive : ''} ${t.key === 'delete' ? styles.tabDanger : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            <i className={`ti ${t.icon}`} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {/* 기본 정보 */}
      {activeTab === 'info' && (
        <div className={styles.section}>
          <div className={styles.avatarRow}>
            <div className={styles.avatarWrapper} onClick={() => fileInputRef.current?.click()} title="클릭하여 이미지 변경">
              {imagePreview ? (
                <img src={imagePreview} alt={member?.name} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarInitials}>{initials}</div>
              )}
              <div className={styles.avatarOverlay}>
                <i className="ti ti-camera" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={handleFileChange}
              />
            </div>
            <div className={styles.userMeta}>
              <div className={styles.userName}>{member?.nickname}</div>
              <div className={styles.userEmail}>{member?.email}</div>
              {member?.provider && <span className={styles.providerBadge}>Google 연동</span>}
              <button type="button" className={styles.changePhotoBtn} onClick={() => fileInputRef.current?.click()}>
                <i className="ti ti-upload" aria-hidden="true" /> 사진 변경
              </button>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleProfileSave}>
            <div className={styles.readonlyGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>아이디</label>
                <input className={styles.input} value={member?.userId ?? ''} disabled />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>이름</label>
                <input className={styles.input} value={member?.name ?? ''} disabled />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>이메일</label>
                <input className={styles.input} value={member?.email ?? ''} disabled />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>전화번호</label>
                <input className={styles.input} value={member?.phoneNumber ?? ''} disabled />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>닉네임</label>
              <input
                className={styles.input}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="2~10자"
                required
              />
            </div>

            {profileMsg   && <p className={styles.msgSuccess}>{profileMsg}</p>}
            {profileError && <p className={styles.msgError}>{profileError}</p>}

            <button type="submit" className={styles.submitBtn} disabled={profileSaving}>
              {profileSaving ? '저장 중...' : '프로필 저장'}
            </button>
          </form>
        </div>
      )}

      {/* 비밀번호 변경 */}
      {activeTab === 'password' && !member?.provider && (
        <div className={styles.section}>
          <form className={styles.form} onSubmit={handleChangePassword}>
            <div className={styles.formGroup}>
              <label className={styles.label}>현재 비밀번호</label>
              <input type="password" className={styles.input} value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>새 비밀번호</label>
              <input type="password" className={styles.input} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="영문, 숫자, 특수문자 포함 8~20자" required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>새 비밀번호 확인</label>
              <input type="password" className={styles.input} value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)} required />
              {newPasswordConfirm && (
                <p className={`${styles.hint} ${newPassword === newPasswordConfirm ? styles.hintSuccess : styles.hintError}`}>
                  {newPassword === newPasswordConfirm ? '✓ 비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                </p>
              )}
            </div>
            {pwError && <p className={styles.msgError}>{pwError}</p>}
            {pwMsg   && <p className={styles.msgSuccess}>{pwMsg}</p>}
            <button type="submit" className={styles.submitBtn} disabled={pwSaving}>
              {pwSaving ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>
      )}

      {/* 회원 탈퇴 */}
      {activeTab === 'delete' && (
        <div className={`${styles.section} ${styles.dangerSection}`}>
          <div className={styles.dangerInfo}>
            <i className="ti ti-alert-triangle" aria-hidden="true" />
            <p>탈퇴 시 모든 문서와 데이터가 삭제되며 복구할 수 없어요.</p>
          </div>
          {!showDeleteConfirm ? (
            <button className={styles.dangerBtn} onClick={() => setShowDeleteConfirm(true)}>
              회원 탈퇴 진행
            </button>
          ) : (
            <div className={styles.confirmGroup}>
              <div className={styles.formGroup}>
                <label className={styles.label}>비밀번호 확인</label>
                <input type="password" className={styles.input} value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)} placeholder="현재 비밀번호 입력" />
              </div>
              <div className={styles.confirmActions}>
                <button className={styles.confirmDeleteBtn} onClick={handleDeleteAccount}
                  disabled={deleting || !deletePassword.trim()}>
                  {deleting ? '처리 중...' : '탈퇴 확인'}
                </button>
                <button className={styles.cancelBtn}
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}>
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
