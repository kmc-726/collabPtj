import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuth2RedirectHandler: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // 1. 주소창(?accessToken=...)에서 토큰 추출
        const accessToken: string | null = searchParams.get('accessToken');

        if (accessToken) {
            // 2. Access Token은 로컬 스토리지에 저장하고 Refresh Token은 HttpOnly 쿠키로 유지
            localStorage.setItem('accessToken', accessToken);

            // 3. 저장이 끝나면 메인 화면으로 이동
            navigate('/home');
        } else {
            // 토큰이 없다면 에러 처리 후 로그인 페이지로 복귀
            alert('로그인에 실패했습니다. 다시 시도해 주세요.');
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2>로그인 처리 중입니다... 🔄</h2>
            <p>잠시만 기다려주세요.</p>
        </div>
    );
};

export default OAuth2RedirectHandler;
