import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import SideBar from './SideBar';

type Member = {
    id: number;
    email: string;
    userId: string;
    nickname: string;
    profileImageUrl?: string | null;
    role: string;
    provider?: string | null;
    name: string;
    phoneNumber: string;
    createdAt: string;
};

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState<Member | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const response = await api.get<Member>('/api/members/me');
                setMember(response.data);
            } catch (error) {
                console.error('내 정보 조회 실패:', error);
                setMember(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMe();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (error) {
            console.error('로그아웃 서버 통신 에러:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');

            alert('로그아웃 되었습니다.');
            navigate('/', { replace: true });
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <SideBar />
            <h1>협업 플랫폼 메인 대시보드 🚀</h1>

            {isLoading ? (
                <h3>로그인 상태를 확인하는 중입니다...</h3>
            ) : member ? (
                <div>
                    <h3 style={{ color: 'green' }}>✅ {member.nickname}님, 정상적으로 로그인된 상태입니다.</h3>
                    <p style={{ color: '#555' }}>{member.email}</p>
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
