package com.mck.collab.member.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mck.collab.member.dto.ChangePasswordRequest;
import com.mck.collab.member.dto.MemberResponse;
import com.mck.collab.member.dto.UpdateProfileRequest;
import com.mck.collab.member.entity.Member;
import com.mck.collab.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    // 내 정보 조회
    public MemberResponse getMyInfo(String userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        return new MemberResponse(member);
    }

    // 프로필 수정 (닉네임, 프로필 이미지)
    @Transactional
    public MemberResponse updateProfile(String userId, UpdateProfileRequest request) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        member.updateProfile(request.getNickname(), request.getProfileImageUrl());
        return new MemberResponse(member);
    }

    // 비밀번호 변경
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
            throw new IllegalArgumentException("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), member.getPassword())) {
            throw new IllegalArgumentException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        }

        member.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    // 회원 검색 (userId 또는 닉네임 LIKE, 본인 제외)
    public List<MemberResponse> searchMembers(String currentUserId, String q) {
        if (q == null || q.isBlank()) return List.of();
        return memberRepository.findByUserIdContainingOrNicknameContaining(q.trim(), q.trim())
                .stream()
                .filter(m -> !m.getUserId().equals(currentUserId))
                .map(MemberResponse::new)
                .collect(Collectors.toList());
    }

    // 회원 탈퇴
    @Transactional
    public void deleteAccount(String userId, String currentPassword) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (!passwordEncoder.matches(currentPassword, member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        memberRepository.delete(member);
    }
}
