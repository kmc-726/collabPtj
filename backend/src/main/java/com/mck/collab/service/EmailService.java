package com.mck.collab.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final int CODE_EXPIRATION_MINUTES = 5;
    private static final int MAX_VERIFY_ATTEMPTS = 5;

    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, VerificationCode> verificationCodes = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> verifiedEmails = new ConcurrentHashMap<>();

    public void sendVerificationCode(String toEmail) {
        String code = generateCode();
        verificationCodes.put(toEmail, new VerificationCode(
                code,
                LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES),
                0
        ));
        verifiedEmails.remove(toEmail);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[협업 플랫폼] 회원가입 이메일 인증번호");
        message.setText("회원가입 인증번호는 [" + code + "] 입니다. "
                + CODE_EXPIRATION_MINUTES + "분 안에 화면에 입력해주세요.");

        mailSender.send(message);
    }

    public boolean verifyCode(String email, String inputCode) {
        VerificationCode storedCode = verificationCodes.get(email);
        if (storedCode == null || storedCode.expiresAt().isBefore(LocalDateTime.now())) {
            verificationCodes.remove(email);
            return false;
        }

        if (storedCode.attempts() >= MAX_VERIFY_ATTEMPTS) {
            verificationCodes.remove(email);
            return false;
        }

        if (storedCode.code().equals(inputCode)) {
            verificationCodes.remove(email);
            verifiedEmails.put(email, LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES));
            return true;
        }

        verificationCodes.put(email, storedCode.incrementAttempts());
        return false;
    }

    public boolean consumeVerifiedEmail(String email) {
        LocalDateTime verifiedUntil = verifiedEmails.get(email);
        if (verifiedUntil == null || verifiedUntil.isBefore(LocalDateTime.now())) {
            verifiedEmails.remove(email);
            return false;
        }

        verifiedEmails.remove(email);
        return true;
    }

    public void sendTemporaryPassword(String toEmail, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[협업 플랫폼] 임시 비밀번호 안내");
        message.setText("임시 비밀번호는 [" + tempPassword + "] 입니다. 로그인 후 반드시 비밀번호를 변경해주세요.");

        mailSender.send(message);
    }

    private String generateCode() {
        return String.format("%06d", random.nextInt(1000000));
    }

    private record VerificationCode(String code, LocalDateTime expiresAt, int attempts) {
        private VerificationCode incrementAttempts() {
            return new VerificationCode(code, expiresAt, attempts + 1);
        }
    }
}
