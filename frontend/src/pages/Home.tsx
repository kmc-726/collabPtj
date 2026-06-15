import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Home: React.FC = () => {
    const navigate = useNavigate();
    // 로컬 스토리지에서 출입증(토큰)을 꺼내봅니다.
    const accessToken: string | null = localStorage.getItem('accessToken');

    const handleLogout = async () => {
        try {
            // 1. 백엔드에 토큰 삭제 요청
            await api.post('/api/auth/logout');
        } catch (error) {
            console.error('로그아웃 서버 통신 에러:', error);
        } finally {
            // 2. 서버 통신 성공 여부와 관계없이 브라우저 토큰은 무조건 삭제!
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId'); // userId도 저장했다면 함께 삭제
            
            alert('로그아웃 되었습니다.');
            navigate('/', { replace: true });
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>협업 플랫폼 메인 대시보드 🚀</h1>
            
            {accessToken ? (
                <div>
                    <h3 style={{ color: 'green' }}>✅ 정상적으로 로그인된 상태입니다.</h3>
                    <button 
                        onClick={handleLogout}
                        style={{ padding: '8px 16px', marginTop: '20px', cursor: 'pointer' }}
                    >
                        로그아웃
                    </button>
                </div>
            ) : (
                <div>
                    <h3 style={{ color: 'red' }}>❌ 로그인이 필요합니다.</h3>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{ padding: '8px 16px', marginTop: '20px', cursor: 'pointer' }}
                    >
                        로그인하러 가기
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
