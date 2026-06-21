package com.mck.collab.security;

import java.io.IOException;
import java.util.List;

import com.mck.collab.member.entity.Member;
import com.mck.collab.member.repository.MemberRepository;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final MemberRepository memberRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 1. 요청 헤더(Header)에서 JWT 토큰을 꺼냅니다.
        String token = resolveToken(request);

        // 2. 토큰이 존재하고, 위조되지 않았는지 검사합니다.
        if (token != null && jwtProvider.validateToken(token)) {
            // 3. 정상 토큰이라면 안에 들어있는 유저 ID를 빼냅니다.
            String userId = jwtProvider.getUserIdFromToken(token);

            memberRepository.findByUserId(userId).ifPresent(member -> {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                member.getUserId(),
                                null,
                                createAuthorities(member)
                        );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }

        // 검사가 끝났으니 다음 로직(컨트롤러 등)으로 요청을 통과시킵니다.
        filterChain.doFilter(request, response);
    }

    // 클라이언트가 보낸 "Bearer asdf123..." 형태에서 "Bearer "를 떼어내고 순수 토큰만 추출하는 헬퍼 메서드
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private List<SimpleGrantedAuthority> createAuthorities(Member member) {
        return List.of(new SimpleGrantedAuthority(member.getRole()));
    }
}
