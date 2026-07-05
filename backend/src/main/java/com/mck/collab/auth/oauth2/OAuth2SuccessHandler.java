package com.mck.collab.auth.oauth2;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.mck.collab.auth.entity.RefreshToken;
import com.mck.collab.auth.repository.RefreshTokenRepository;
import com.mck.collab.member.entity.Member;
import com.mck.collab.member.repository.MemberRepository;
import com.mck.collab.security.JwtProvider;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        String accessToken = jwtProvider.createToken(member.getUserId());
        String refreshToken = jwtProvider.createRefreshToken(member.getUserId());

        // ✅ plain text로 저장, PasswordEncoder 의존성 제거
        RefreshToken savedToken = refreshTokenRepository.findById(member.getUserId())
                .orElse(RefreshToken.builder().userId(member.getUserId()).token(refreshToken).build());
        savedToken.updateToken(refreshToken);
        refreshTokenRepository.save(savedToken);

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(jwtProvider.getRefreshTokenValidityInSeconds())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        String targetUrl = "http://localhost:5173/oauth2/redirect?accessToken=" + accessToken;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
