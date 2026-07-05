package com.mck.collab.member.dto;

import java.time.LocalDateTime;

import com.mck.collab.member.entity.Member;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberResponse {

    private Long id;
    private String email;
    private String userId;
    private String nickname;
    private String profileImageUrl;
    private String role;
    private String provider;
    private String name;
    private String phoneNumber;
    private LocalDateTime createdAt;

    public static MemberResponse from(Member member) {
        return MemberResponse.builder()
                .id(member.getId())
                .email(member.getEmail())
                .userId(member.getUserId())
                .nickname(member.getNickname())
                .profileImageUrl(member.getProfileImageUrl())
                .role(member.getRole())
                .provider(member.getProvider())
                .name(member.getName())
                .phoneNumber(member.getPhoneNumber())
                .createdAt(member.getCreatedAt())
                .build();
    }
}
