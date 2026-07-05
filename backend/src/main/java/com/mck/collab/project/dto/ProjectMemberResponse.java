package com.mck.collab.project.dto;

import java.time.LocalDateTime;

import com.mck.collab.project.entity.ProjectMember;

import lombok.Getter;

@Getter
public class ProjectMemberResponse {

    private final String userId;
    private final String nickname;
    private final String profileImageUrl;
    private final String role;
    private final LocalDateTime joinedAt;

    public ProjectMemberResponse(ProjectMember pm) {
        this.userId = pm.getMember().getUserId();
        this.nickname = pm.getMember().getNickname();
        this.profileImageUrl = pm.getMember().getProfileImageUrl();
        this.role = pm.getRole().name();
        this.joinedAt = pm.getJoinedAt();
    }
}
