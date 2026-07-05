import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkId, sendEmailCode, verifyEmailCode, signUp } from '../../api/auth';
import styles from './SignUpPage.module.css';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', userId: '', password: '', passwordConfirm: '', nickname: '', name: '', phoneNumber: '' });
  const [emailCode, setEmailCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [idChecked, setIdChecked] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hints, setHints] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === 'userId') setIdChecked(null);
  };

  const handleCheckId = async () => {
    if (!form.userId) return;
    const isDuplicate = await checkId(form.userId);
    setIdChecked(!isDuplicate);
    setHints((h) => ({ ...h, userId: isDuplicate ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다.' }));
  };

  const handleSendCode = async () => {
    if (!form.email) return;
    try {
      await sendEmailCode(form.email);
      setEmailSent(true);
      setHints((h) => ({ ...h, email: '인증번호가 발송되었습니다.' }));
    } catch (e: any) {
      setHints((h) => ({ ...h, email: e.response?.data?.message ?? '발송 실패' }));
    }
  };

  const handleVerifyCode = async () => {
    try {
      const ok = await verifyEmailCode(form.email, emailCode);
      setEmailVerified(ok);
      setHints((h) => ({ ...h, emailCode: ok ? '인증 완료!' : '인증번호가 올바르지 않습니다.' }));
    } catch {
      setHints((h) => ({ ...h, emailCode: '인증 실패' }));
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!emailVerified) return setError('이메일 인증을 완료해 주세요.');
    if (idChecked !== true) return setError('아이디 중복 확인을 해 주세요.');
    if (form.password !== form.passwordConfirm) return setError('비밀번호가 일치하지 않습니다.');
    setLoading(true);
    try {
      await signUp({ email: form.email, userId: form.userId, password: form.password, nickname: form.nickname, name: form.name, phoneNumber: form.phoneNumber });
      alert('회원가입이 완료되었습니다!');
      navigate('/login', { replace: true });
    } catch (e: any) {
      setError(e.response?.data?.message ?? '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <i className={`ti ti-arrow-left ${styles.backIcon}`} aria-hidden="true" /> 로그인으로
        </button>

        <h1 className={styles.title}>회원가입</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>이메일</label>
            <div className={styles.inputRow}>
              <input
                type="email"
                className={styles.inputFlex}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="example@email.com"
                required
                disabled={emailVerified}
              />
              <button type="button" className={styles.inlineBtn} onClick={handleSendCode} disabled={emailVerified}>
                {emailSent ? '재발송' : '인증번호 발송'}
              </button>
            </div>
            {hints.email && <p className={`${styles.hint} ${styles.hintSuccess}`}>{hints.email}</p>}
          </div>

          {emailSent && !emailVerified && (
            <div className={styles.formGroup}>
              <label className={styles.label}>인증번호</label>
              <div className={styles.inputRow}>
                <input
                  type="text"
                  className={styles.inputFlex}
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  placeholder="인증번호 6자리"
                />
                <button type="button" className={styles.inlineBtn} onClick={handleVerifyCode}>확인</button>
              </div>
              {hints.emailCode && (
                <p className={`${styles.hint} ${emailVerified ? styles.hintSuccess : styles.hintError}`}>
                  {hints.emailCode}
                </p>
              )}
            </div>
          )}
          {emailVerified && <p className={styles.successText}>✓ 이메일 인증 완료</p>}

          <div className={styles.formGroup}>
            <label className={styles.label}>아이디</label>
            <div className={styles.inputRow}>
              <input
                type="text"
                className={styles.inputFlex}
                value={form.userId}
                onChange={(e) => set('userId', e.target.value)}
                placeholder="영문, 숫자 4~12자"
                required
              />
              <button type="button" className={styles.inlineBtn} onClick={handleCheckId}>중복 확인</button>
            </div>
            {hints.userId && (
              <p className={`${styles.hint} ${idChecked ? styles.hintSuccess : styles.hintError}`}>
                {hints.userId}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>비밀번호</label>
            <input
              type="password"
              className={styles.input}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="영문, 숫자, 특수문자 포함 8~20자"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>비밀번호 확인</label>
            <input
              type="password"
              className={styles.input}
              value={form.passwordConfirm}
              onChange={(e) => set('passwordConfirm', e.target.value)}
              placeholder="비밀번호 재입력"
              required
            />
            {form.passwordConfirm && (
              <p className={`${styles.hint} ${form.password === form.passwordConfirm ? styles.hintSuccess : styles.hintError}`}>
                {form.password === form.passwordConfirm ? '✓ 비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>닉네임</label>
            <input type="text" className={styles.input} value={form.nickname} onChange={(e) => set('nickname', e.target.value)} placeholder="2~10자" required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>이름</label>
            <input type="text" className={styles.input} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="실명 입력" required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>전화번호</label>
            <input type="tel" className={styles.input} value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} placeholder="010-1234-5678" required />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
