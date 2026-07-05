package com.mck.collab.member.dto;

import com.mck.collab.member.entity.Member;
import lombok.Getter;

@Getter
public class MemberResponse {

    private final Long id;
    private final String userId;
    private final String email;
    private final String name;
    private final String nickname;
    private final String profileImageUrl;
    private final String phoneNumber;
    private final String role;
    private final String provider;

    public MemberResponse(Member member) {
        this.id = member.getId();
        this.userId = member.getUserId();
        this.email = member.getEmail();
        this.name = member.getName();
        this.nickname = member.getNickname();
        this.profileImageUrl = member.getProfileImageUrl();
        this.phoneNumber = member.getPhoneNumber();
        this.role = member.getRole();
        this.provider = member.getProvider();
    }
}
