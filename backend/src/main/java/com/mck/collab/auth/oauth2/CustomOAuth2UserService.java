package com.mck.collab.auth.oauth2;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.mck.collab.member.entity.Member;
import com.mck.collab.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String provider   = userRequest.getClientRegistration().getRegistrationId();
        String providerId = (String) attributes.get("sub");
        String email      = (String) attributes.get("email");
        String name       = (String) attributes.get("name");
        String picture    = (String) attributes.get("picture");

        Member member = memberRepository.findByEmail(email).orElse(null);

        if (member == null) {
            // 신규 구글 유저 → 자동 계정 생성
            String baseUserId = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
            String userId = generateUniqueUserId(baseUserId);
            String nickname = (name != null && !name.isBlank()) ? name : baseUserId;

            member = Member.builder()
                    .email(email)
                    .userId(userId)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .nickname(nickname)
                    .name(nickname)
                    .phoneNumber("000-0000-0000")
                    .provider(provider)
                    .providerId(providerId)
                    .profileImageUrl(picture)
                    .build();
            memberRepository.save(member);
        } else {
            // 기존 계정 → 구글 연동 및 프로필 업데이트
            if (member.getProvider() == null) {
                member.setProvider(provider);
                member.setProviderId(providerId);
            }
            member.updateProfile(name, picture);
            memberRepository.save(member);
        }

        return new DefaultOAuth2User(
                Collections.emptyList(),
                attributes,
                "email"
        );
    }

    private String generateUniqueUserId(String base) {
        String candidate = base;
        int suffix = 1;
        while (memberRepository.existsByUserId(candidate)) {
            candidate = base + suffix++;
        }
        return candidate;
    }
}
