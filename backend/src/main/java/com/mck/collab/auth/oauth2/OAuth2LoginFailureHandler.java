package com.mck.collab.auth.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        
        // 우리가 CustomOAuth2UserService에서 던진 에러 메시지를 꺼냅니다.
        String errorMessage = exception.getMessage();
        
        // 방어 코드 추가: 메시지가 비어있다면(null) 우리가 만든 기본 메시지 세팅!
        if (errorMessage == null || errorMessage.isEmpty()) {
            errorMessage = "가입되지 않은 이메일입니다. 회원가입 후 연동해주세요.";
        }
        
        // 한글이 깨지지 않도록 URL 인코딩 처리
        String encodedMessage = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);

        // 리액트의 로그인 화면으로 리다이렉트하면서 파라미터로 에러 메시지를 달아줍니다.
        String redirectUrl = "http://localhost:5173/?error=" + encodedMessage;
        
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}