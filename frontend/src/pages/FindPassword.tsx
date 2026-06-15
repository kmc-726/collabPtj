import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const FindPassword: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userId: '',
        email: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFindPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/auth/find-password', formData);

            alert(response.data.message);
                navigate('/login');
        } catch (error:any) {
            console.error('비밀번호 찾기 에러:', error);
            const message = error.response?.data?.message || '입력하신 정보가 일치하지 않습니다.';
            alert(`초기화 실패: ${message}`);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>비밀번호 찾기</h2>
            <p>가입하신 아이디와 이메일을 입력하시면,<br/>임시 비밀번호를 발급해 드립니다.</p>
            
            <form onSubmit={handleFindPassword} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <input type="text" name="userId" placeholder="아이디" required onChange={handleChange} style={inputStyle} />
                <input type="email" name="email" placeholder="이메일 주소" required onChange={handleChange} style={inputStyle} />
                
                <button type="submit" style={buttonStyle}>임시 비밀번호 발급</button>
            </form>

            <div style={{ marginTop: '30px' }}>
                <button onClick={() => navigate('/login')} style={linkButtonStyle}>로그인으로 돌아가기</button>
            </div>
        </div>
    );
};

const inputStyle = { padding: '10px', width: '250px', fontSize: '16px' };
const buttonStyle = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#FF5722', color: 'white', border: 'none', borderRadius: '5px', width: '274px' };
const linkButtonStyle = { cursor: 'pointer', background: 'none', border: 'none', color: 'blue', textDecoration: 'underline' };

export default FindPassword;