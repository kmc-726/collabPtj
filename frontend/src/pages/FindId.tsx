import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const FindId: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [foundId, setFoundId] = useState<string | null>(null);

    const handleFindId = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/auth/find-id', { email });

            const result = await response.data;

            setFoundId(result.userId);
        } catch (error:any) {
            console.error('아이디 찾기 에러:', error);
            if (error.response && error.response.data) {
                alert(`조회 실패: ${error.response.data.message || '입력하신 이메일로 가입된 정보가 없습니다.'}`);
            } else {
                alert('서버와 통신할 수 없습니다.');
            }
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>아이디 찾기</h2>
            <p>가입 시 등록한 이메일을 입력해 주세요.</p>

            <form onSubmit={handleFindId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <input
                    type="email"
                    placeholder="이메일 주소"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                />
                <button type="submit" style={buttonStyle}>아이디 찾기</button>
            </form>

            {foundId && (
                <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', display: 'inline-block' }}>
                    <p style={{ margin: '0', fontSize: '18px' }}>
                        회원님의 아이디는 <strong>{foundId}</strong> 입니다.
                    </p>
                </div>
            )}

            <div style={{ marginTop: '30px' }}>
                <button onClick={() => navigate('/login')} style={linkButtonStyle}>로그인으로 돌아가기</button>
            </div>
        </div>
    );
};

const inputStyle = { padding: '10px', width: '250px', fontSize: '16px' };
const buttonStyle = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', width: '274px' };
const linkButtonStyle = { cursor: 'pointer', background: 'none', border: 'none', color: 'blue', textDecoration: 'underline' };

export default FindId;