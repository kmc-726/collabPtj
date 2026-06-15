package com.mck.collab.security;

import com.mck.collab.entity.Member;
import com.mck.collab.entity.RefreshToken;
import com.mck.collab.repository.MemberRepository;
import com.mck.collab.repository.RefreshTokenRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        // 1. 방금 로그인 성공한 구글 유저 정보 꺼내기
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");

        // 2. DB에서 해당 유저의 정보(userId) 찾기
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 3. JWT Access Token, Refresh Token 발급
        String accessToken = jwtProvider.createToken(member.getUserId());
        String refreshToken = jwtProvider.createRefreshToken(member.getUserId());
        String encodedRefreshToken = passwordEncoder.encode(refreshToken);

        // 4. Refresh Token을 DB에 저장
        RefreshToken savedToken = refreshTokenRepository.findById(member.getUserId())
                .orElse(RefreshToken.builder().userId(member.getUserId()).token(encodedRefreshToken).build());
        savedToken.updateToken(encodedRefreshToken);
        refreshTokenRepository.save(savedToken);

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(jwtProvider.getRefreshTokenValidityInSeconds())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        // 5. 프론트엔드(React/Vite 기본 포트인 5173 사용)로 리다이렉트
        String targetUrl = "http://localhost:5173/oauth2/redirect" 
                + "?accessToken=" + accessToken;

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
