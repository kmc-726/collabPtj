package com.mck.collab.service;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mck.collab.dto.FindIdRequest;
import com.mck.collab.dto.FindPasswordRequest;
import com.mck.collab.dto.LoginRequest;
import com.mck.collab.dto.SignUpRequest;
import com.mck.collab.dto.TokenResponse;
import com.mck.collab.entity.Member;
import com.mck.collab.entity.RefreshToken;
import com.mck.collab.repository.MemberRepository;
import com.mck.collab.repository.RefreshTokenRepository;
import com.mck.collab.security.JwtProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailService emailService;

    // 1. 회원가입 로직
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

    // 2. 로그인 및 토큰 발급 로직
    @Transactional
    public TokenResponse login(LoginRequest request) {
        Member member = memberRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 아이디입니다."));
//
//        System.out.println("DB 비밀번호: " + member.getPassword());
//        System.out.println("입력 비밀번호: " + request.getPassword());
//        
//        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
//            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
//        }
        boolean isMatch = passwordEncoder.matches(request.getPassword(), member.getPassword());
        
        System.out.println("입력한 값: " + request.getPassword());
        System.out.println("DB에 저장된 값: " + member.getPassword());
        System.out.println("일치 여부: " + isMatch);

        if (!isMatch) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        
        String accessToken = jwtProvider.createToken(member.getUserId());
        String refreshToken = jwtProvider.createRefreshToken(member.getUserId());
//        String encodedRefreshToken = passwordEncoder.encode(refreshToken);
        String savedRefreshToken = refreshToken;

        //
        RefreshToken savedToken = refreshTokenRepository.findById(member.getUserId())
        		.orElse(RefreshToken.builder().userId(member.getUserId()).token(savedRefreshToken).build());
        savedToken.updateToken(savedRefreshToken);
        refreshTokenRepository.save(savedToken);
        
        return new TokenResponse(accessToken, refreshToken);
    }
    
    // Access Token 만료 시 Refresh Token으로 재발급
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
        // RefreshToken 테이블에서 해당 userId를 가진 데이터(토큰)를 바로 날려버립니다!
        refreshTokenRepository.deleteById(userId);
    }
    
    // 아이디 찾기
    @Transactional(readOnly = true)
    public String findUserId(FindIdRequest request) {
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일로 가입된 회원이 없습니다."));
        
        // 소셜 가입자 분기 처리
        if (member.getProvider() != null) {
            return "구글 소셜 계정으로 가입된 회원입니다.";
        }
        
        return member.getUserId();
    }

    // 비밀번호 찾기 (임시 비밀번호 발급)
    @Transactional
    public String resetPassword(FindPasswordRequest request) {
        Member member = memberRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 아이디입니다."));

        if (!member.getEmail().equals(request.getEmail())) {
            throw new IllegalArgumentException("아이디와 이메일 정보가 일치하지 않습니다.");
        }

        // 16자리 임시 비밀번호 생성
        String tempPassword = UUID.randomUUID().toString().substring(0, 16);
        
        // DB에 암호화하여 저장
        member.setPassword(passwordEncoder.encode(tempPassword));
        memberRepository.save(member);
        refreshTokenRepository.deleteById(member.getUserId());

        emailService.sendTemporaryPassword(member.getEmail(), tempPassword);

        return "등록된 이메일로 임시 비밀번호가 발송되었습니다.";
    }
    
    // 유저Id 중복확인
    @Transactional(readOnly = true)
    public boolean checkIdDuplication(String userId) {
    	return memberRepository.existsByUserId(userId);
    }
    
}
