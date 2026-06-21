package com.mck.collab.auth.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mck.collab.auth.dto.FindIdRequest;
import com.mck.collab.auth.dto.FindPasswordRequest;
import com.mck.collab.auth.dto.LoginRequest;
import com.mck.collab.auth.dto.SignUpRequest;
import com.mck.collab.auth.dto.TokenRefreshRequest;
import com.mck.collab.auth.dto.TokenResponse;
import com.mck.collab.auth.service.AuthService;
import com.mck.collab.auth.service.EmailService;
import com.mck.collab.security.JwtProvider;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;
    private final JwtProvider jwtProvider;

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody SignUpRequest request) {
        if (!emailService.consumeVerifiedEmail(request.getEmail())) {
            throw new IllegalArgumentException("이메일 인증을 먼저 완료해 주세요.");
        }

        authService.register(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "회원가입이 완료되었습니다.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-id")
    public ResponseEntity<Map<String, Boolean>> checkId(@RequestParam("userId") String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("아이디를 입력해 주세요.");
        }

        boolean isDuplicate = authService.checkIdDuplication(userId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isDuplicate", isDuplicate);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokenResponse = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createRefreshTokenCookie(tokenResponse.getRefreshToken()).toString())
                .body(new TokenResponse(tokenResponse.getAccessToken(), null));
    }

    @PostMapping("/reissue")
    public ResponseEntity<TokenResponse> reissue(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            @RequestBody(required = false) TokenRefreshRequest request
    ) {
        String token = refreshToken != null ? refreshToken : request != null ? request.getRefreshToken() : null;
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Refresh Token 은 필수입니다.");
        }

        TokenResponse tokenResponse = authService.reissue(token);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createRefreshTokenCookie(tokenResponse.getRefreshToken()).toString())
                .body(new TokenResponse(tokenResponse.getAccessToken(), null));
    }

    @PostMapping("/find-id")
    public ResponseEntity<Map<String, String>> findId(@Valid @RequestBody FindIdRequest request) {
        String userId = authService.findUserId(request);
        Map<String, String> response = new HashMap<>();
        response.put("userId", userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/find-password")
    public ResponseEntity<Map<String, String>> findPassword(@Valid @RequestBody FindPasswordRequest request) {
        String message = authService.resetPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/email/send")
    public ResponseEntity<Map<String, String>> sendEmailCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("이메일을 입력해 주세요.");
        }

        emailService.sendVerificationCode(email);

        Map<String, String> response = new HashMap<>();
        response.put("message", "인증번호가 발송되었습니다. 이메일을 확인해 주세요.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/email/verify")
    public ResponseEntity<Map<String, Boolean>> verifyEmailCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        boolean isVerified = emailService.verifyCode(email, code);

        Map<String, Boolean> response = new HashMap<>();
        response.put("isVerified", isVerified);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        authService.logout(authentication.getName());

        Map<String, String> response = new HashMap<>();
        response.put("message", "성공적으로 로그아웃 되었습니다.");
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteRefreshTokenCookie().toString())
                .body(response);
    }

    private ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(jwtProvider.getRefreshTokenValidityInSeconds())
                .build();
    }

    private ResponseCookie deleteRefreshTokenCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }
}
