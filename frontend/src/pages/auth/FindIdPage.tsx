import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findId } from '../../api/auth';
import styles from './find.module.css';

const FindIdPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setResult('');
    setLoading(true);
    try {
      const userId = await findId(email);
      setResult(userId);
    } catch (e: any) {
      setError(e.response?.data?.message ?? '아이디를 찾을 수 없습니다.');
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

        <h1 className={styles.title}>아이디 찾기</h1>
        <p className={styles.subtitle}>가입 시 등록한 이메일을 입력해 주세요.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>이메일</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          {result && (
            <div className={styles.resultBox}>
              <p className={styles.resultLabel}>회원님의 아이디는</p>
              <p className={styles.resultValue}>{result}</p>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '조회 중...' : '아이디 찾기'}
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

export default FindIdPage;
