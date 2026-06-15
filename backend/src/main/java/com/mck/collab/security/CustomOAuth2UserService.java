package com.mck.collab.security;

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

import com.mck.collab.entity.Member;
import com.mck.collab.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService{
	
	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;
	
	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException{
		// 1. 구글에서 유저 정보 가져오기
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // 2. 구글이 넘겨준 데이터 추출
        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"
        String providerId = (String) attributes.get("sub"); // 구글 고유 식별자
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        // 3. 우리 DB에 이메일로 가입된 유저가 있는지 확인
        Member member = memberRepository.findByEmail(email).orElse(null);

        if (member == null) {
        	throw new OAuth2AuthenticationException("가입되지 않은 이메일입니다. 회원가입 후 연동해주세요.");
        } else {
            // 🌟 기존 연동 로직은 그대로 유지합니다.
            if (member.getProvider() == null) {
                member.setProvider(provider);
                member.setProviderId(providerId);
                System.out.println("기존 일반 계정이 구글 계정과 성공적으로 연동되었습니다! (이메일: " + email + ")");
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

}
