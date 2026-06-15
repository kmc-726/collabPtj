import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import FindId from './pages/FindId';
import FindPassword from './pages/FindPassword';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                
                {/* 아이디/비밀번호 찾기 경로 */}
                <Route path="/find-id" element={<FindId />} />
                <Route path="/find-password" element={<FindPassword />} />
                
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;