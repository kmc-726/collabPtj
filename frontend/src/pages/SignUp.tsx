import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

type formData = {
    email: string;
    userId: string;
    password: string;
    nickname: string;
    name: string;
    phoneNumber: string;
}

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<formData>({
        email: '',
        userId: '',
        password: '',
        nickname: '',
        name: "",
        phoneNumber: ""
    });

    const [isIdAvailable, setIsIdAvailable] = useState<boolean | null>(null);

    // 이메일 인증 관련 상태 추가
    const [inputCode, setInputCode] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'userId') setIsIdAvailable(null);
        if (name === 'email') {
            setIsEmailSent(false);
            setIsEmailVerified(null);
        }
    };

    // 이메일 인증번호 전송 함수
    const handleSendEmailCode = async () => {
        if (!formData.email.trim()) {
            alert('이메일을 입력해 주세요.');
            return;
        }
        try {
            const response = await api.post('/api/auth/email/send', { email: formData.email });
            const result = await response.data;

            alert(result.message);
            setIsEmailSent(true);

        } catch (error) {
            console.error(error);
            alert('서버와 통신할 수 없습니다.');
        }
    };

    // 인증번호 검증 함수
    const handleVerifyEmailCode = async () => {
        try {
            // 수정: api.post 사용
            const response = await api.post('/api/auth/email/verify', { email: formData.email, code: inputCode });
            if (response.data.isVerified) {
                alert('이메일 인증이 완료되었습니다.');
                setIsEmailVerified(true);
            } else {
                alert('인증번호가 틀렸습니다.');
                setIsEmailVerified(false);
            }
        } catch (error: any) {
            console.error(error);
            alert('인증 서버 통신 실패');
        }
    };

    const handleCheckId = async () => {
        if (!formData.userId.trim()) {
            alert('아이디를 먼저 입력해 주세요.');
            return;
        }
        try {
            // 🌟 수정: api.get 사용 (쿼리 파라미터 전달)
            const response = await api.get('/api/auth/check-id', { params: { userId: formData.userId } });
            setIsIdAvailable(!response.data.isDuplicate);
        } catch (error) {
            console.error(error);
            alert('서버와 통신할 수 없습니다.');
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEmailVerified !== true) { alert('이메일 인증을 완료해 주세요.'); return; }
        if (isIdAvailable !== true) { alert('아이디 중복 확인을 완료해 주세요.'); return; }

        try {
            // 🌟 수정: api.post 사용 (formData 전체 객체 전송)
            const response = await api.post('/api/auth/signup', formData);
            alert(response.data.message);
            navigate('/');
        } catch (error: any) {
            console.error(error);
            alert(`가입 실패: ${error.response?.data?.message || '알 수 없는 오류'}`);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>회원가입</h2>
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>

                {/* 이메일 입력 및 전송 */}
                <div style={{ display: 'flex', width: '274px', gap: '10px' }}>
                    <input type="email" name="email" placeholder="이메일" required onChange={handleChange} disabled={isEmailVerified === true} style={{ ...inputStyle, width: '180px' }} />
                    <button type="button" onClick={handleSendEmailCode} disabled={isEmailVerified === true} style={checkButtonStyle}>
                        {isEmailSent ? '재전송' : '인증요청'}
                    </button>
                </div>

                {/* 인증번호 입력 (메일 발송 후에만 보임) */}
                {isEmailSent && isEmailVerified !== true && (
                    <div style={{ display: 'flex', width: '274px', gap: '10px', marginTop: '-5px' }}>
                        <input type="text" placeholder="6자리 인증번호" value={inputCode} onChange={(e) => setInputCode(e.target.value)} style={{ ...inputStyle, width: '180px' }} />
                        <button type="button" onClick={handleVerifyEmailCode} style={{ ...checkButtonStyle, backgroundColor: '#FF5722' }}>
                            확인
                        </button>
                    </div>
                )}
                {isEmailVerified === true && <span style={{ color: 'green', fontSize: '13px', marginTop: '-10px' }}>✅ 이메일 인증 완료</span>}

                {/* 아이디 입력 및 중복 확인 */}
                <div style={{ display: 'flex', width: '274px', gap: '10px' }}>
                    <input type="text" name="userId" placeholder="아이디 (4~12자)" required onChange={handleChange} style={{ ...inputStyle, width: '180px' }} />
                    <button type="button" onClick={handleCheckId} style={checkButtonStyle}>중복 확인</button>
                </div>
                {isIdAvailable === true && <span style={{ color: 'green', fontSize: '13px', marginTop: '-10px' }}>✅ 사용 가능한 아이디입니다.</span>}
                {isIdAvailable === false && <span style={{ color: 'red', fontSize: '13px', marginTop: '-10px' }}>❌ 이미 사용 중인 아이디입니다.</span>}

                <input type="password" name="password" placeholder="비밀번호 (특수문자 포함 8~20자)" required onChange={handleChange} style={inputStyle} />
                <input type="text" name="name" placeholder="이름" required onChange={handleChange} style={inputStyle} />
                <input type="tel" name="phoneNumber" placeholder="전화번호" required onChange={handleChange} style={inputStyle} />
                <input type="text" name="nickname" placeholder="닉네임" required onChange={handleChange} style={inputStyle} />

                <button type="submit" style={buttonStyle}>가입하기</button>
            </form>
            <button onClick={() => navigate('/')} style={{ marginTop: '20px', cursor: 'pointer', background: 'none', border: 'none', color: 'blue' }}>
                이미 계정이 있으신가요? 로그인하기
            </button>
        </div>
    );
};

const inputStyle = { padding: '10px', width: '250px', fontSize: '16px', boxSizing: 'border-box' as const };
const buttonStyle = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', width: '274px' };
const checkButtonStyle = { padding: '10px', fontSize: '14px', cursor: 'pointer', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '5px', flexShrink: 0 };

export default SignUp;
