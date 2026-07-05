import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findPassword } from '../../api/auth';
import styles from './find.module.css';

const FindPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setResult('');
    setLoading(true);
    try {
      const message = await findPassword(userId, email);
      setResult(message);
    } catch (e: any) {
      setError(e.response?.data?.message ?? '비밀번호 찾기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <i className="ti ti-arrow-left" aria-hidden="true" /> 뒤로가기
        </button>

        <h1 className={styles.title}>비밀번호 찾기</h1>
        <p className={styles.subtitle}>아이디와 가입 이메일을 입력하면 임시 비밀번호를 보내드려요.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>아이디</label>
            <input
              type="text"
              className={styles.input}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디 입력"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>이메일</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="가입 시 등록한 이메일"
              required
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          {result && (
            <div className={styles.resultBox}>
              <p className={styles.resultMessage}>✓ {result}</p>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading || !!result}>
            {loading ? '처리 중...' : '임시 비밀번호 발송'}
          </button>

          {result && (
            <button type="button" className={styles.loginBtn} onClick={() => navigate('/login')}>
              로그인하러 가기
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default FindPasswordPage;
