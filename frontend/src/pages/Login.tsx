import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        userId: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStandardLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/auth/login', formData);

            // Axios는 응답 데이터를 response.data에 담아줍니다.
            const result = response.data;

            // Axios는 서버에서 200번대(성공) 응답이 오면 무조건 여기를 실행합니다.
            localStorage.setItem('accessToken', result.accessToken);
            
            // 로그아웃 처리를 위해 userId도 로컬 스토리지에 저장
            localStorage.setItem('userId', formData.userId); 
            
            navigate('/home');
            
        } catch (error: any) {
            // Axios는 서버에서 400, 500 에러를 보내면 자동으로 catch 블록으로 던집니다.
            console.error('로그인 에러:', error);
            
            if (error.response && error.response.data) {
                // 백엔드에서 에러 메시지를 담아 보냈을 경우
                alert(`로그인 실패: ${error.response.data.message || '아이디나 비밀번호를 확인해주세요.'}`);
            } else {
                alert('서버와 통신할 수 없습니다.');
            }
        }
    };

    const handleGoogleLogin = (): void => {
        window.location.href = `${api.defaults.baseURL}/oauth2/authorization/google`;
    };

    // 화면이 렌더링될 때 URL에 error 파라미터가 있는지 검사
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const errorMsg = params.get('error');

        if (errorMsg) {
            alert(errorMsg); 
            navigate('/', { replace: true }); 
        }
    }, [location, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>협업 플랫폼 로그인</h2>
            
            <form onSubmit={handleStandardLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <input type="text" name="userId" placeholder="아이디" required onChange={handleChange} style={inputStyle} />
                <input type="password" name="password" placeholder="비밀번호" required onChange={handleChange} style={inputStyle} />
                <button type="submit" style={buttonStyle}>로그인</button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', fontSize: '14px' }}>
                <button onClick={() => navigate('/find-id')} style={textButtonStyle}>아이디 찾기</button>
                <span style={{ color: '#ccc' }}>|</span>
                <button onClick={() => navigate('/find-password')} style={textButtonStyle}>비밀번호 찾기</button>
                <span style={{ color: '#ccc' }}>|</span>
                <button onClick={() => navigate('/signup')} style={textButtonStyle}>회원가입</button>
            </div>

            <hr style={{ width: '300px', marginBottom: '30px' }} />

            <button onClick={handleGoogleLogin} style={googleButtonStyle}>
                Google 계정으로 로그인
            </button>
        </div>
    );
};

const inputStyle = { padding: '10px', width: '250px', fontSize: '16px' };
const buttonStyle = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', width: '274px' };
const googleButtonStyle = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '5px', width: '274px' };
const textButtonStyle = { cursor: 'pointer', background: 'none', border: 'none', color: '#555' };

export default Login;
