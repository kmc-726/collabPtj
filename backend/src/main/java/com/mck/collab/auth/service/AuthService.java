package com.mck.collab.auth.service;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mck.collab.auth.dto.FindIdRequest;
import com.mck.collab.auth.dto.FindPasswordRequest;
import com.mck.collab.auth.dto.LoginRequest;
import com.mck.collab.auth.dto.SignUpRequest;
import com.mck.collab.auth.dto.TokenResponse;
import com.mck.collab.auth.entity.RefreshToken;
import com.mck.collab.auth.repository.RefreshTokenRepository;
import com.mck.collab.member.entity.Member;
import com.mck.collab.member.repository.MemberRepository;
import com.mck.collab.security.JwtProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailService emailService;

    @Transactional
    public void register(SignUpRequest request) {
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (memberRepository.existsByUserId(request.getUserId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        Member member = Member.builder()
                .email(request.getEmail())
                .userId(request.getUserId())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .profileImageUrl(request.getProfileImageUrl())
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .build();

        memberRepository.save(member);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        Member member = memberRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 아이디입니다."));

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtProvider.createToken(member.getUserId());
        String refreshToken = jwtProvider.createRefreshToken(member.getUserId());
        String encodedRefreshToken = passwordEncoder.encode(refreshToken);

        RefreshToken savedToken = refreshTokenRepository.findById(member.getUserId())
                .orElse(RefreshToken.builder().userId(member.getUserId()).token(encodedRefreshToken).build());
        savedToken.updateToken(encodedRefreshToken);
        refreshTokenRepository.save(savedToken);

        return new TokenResponse(accessToken, refreshToken);
    }

    @Transactional
    public TokenResponse reissue(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Refresh Token이 유효하지 않거나 만료되었습니다. 다시 로그인해주세요.");
        }

        String userId = jwtProvider.getUserIdFromToken(refreshToken);

        RefreshToken savedToken = refreshTokenRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("로그아웃된 사용자입니다."));

        if (!passwordEncoder.matches(refreshToken, savedToken.getToken())) {
            throw new IllegalArgumentException("토큰 정보가 일치하지 않습니다.");
        }

        String newAccessToken = jwtProvider.createToken(userId);
        String newRefreshToken = jwtProvider.createRefreshToken(userId);
        String encodedNewRefreshToken = passwordEncoder.encode(newRefreshToken);

        savedToken.updateToken(encodedNewRefreshToken);

        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String userId) {
        refreshTokenRepository.deleteById(userId);
    }

    @Transactional(readOnly = true)
    public String findUserId(FindIdRequest request) {
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일로 가입된 회원이 없습니다."));

        if (member.getProvider() != null) {
            return "구글 소셜 계정으로 가입된 회원입니다.";
        }

        return member.getUserId();
    }

    @Transactional
    public String resetPassword(FindPasswordRequest request) {
        Member member = memberRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 아이디입니다."));

        if (!member.getEmail().equals(request.getEmail())) {
            throw new IllegalArgumentException("아이디와 이메일 정보가 일치하지 않습니다.");
        }

        String tempPassword = UUID.randomUUID().toString().substring(0, 16);

        member.setPassword(passwordEncoder.encode(tempPassword));
        memberRepository.save(member);
        refreshTokenRepository.deleteById(member.getUserId());

        emailService.sendTemporaryPassword(member.getEmail(), tempPassword);

        return "등록된 이메일로 임시 비밀번호가 발송되었습니다.";
    }

    @Transactional(readOnly = true)
    public boolean checkIdDuplication(String userId) {
        return memberRepository.existsByUserId(userId);
    }
}
