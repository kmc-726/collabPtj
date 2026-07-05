package com.mck.collab.member.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mck.collab.member.dto.ChangePasswordRequest;
import com.mck.collab.member.dto.MemberResponse;
import com.mck.collab.member.dto.UpdateProfileRequest;
import com.mck.collab.member.service.MemberService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // 회원 검색 (userId 또는 닉네임 LIKE, 본인 제외)
    @GetMapping("/search")
    public ResponseEntity<List<MemberResponse>> searchMembers(
            @RequestParam String q,
            Authentication authentication) {
        return ResponseEntity.ok(memberService.searchMembers(authentication.getName(), q));
    }

    // 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<MemberResponse> getMyInfo(Authentication authentication) {
        return ResponseEntity.ok(memberService.getMyInfo(authentication.getName()));
    }

    // 프로필 수정
    @PutMapping("/me/profile")
    public ResponseEntity<MemberResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(memberService.updateProfile(authentication.getName(), request));
    }

    // 비밀번호 변경
    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        memberService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));
    }

    // 회원 탈퇴
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String password = request.get("password");
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("비밀번호를 입력해 주세요.");
        }
        memberService.deleteAccount(authentication.getName(), password);
        return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다."));
    }
}
