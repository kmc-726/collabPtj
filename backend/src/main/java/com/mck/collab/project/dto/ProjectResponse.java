package com.mck.collab.project.dto;

import java.time.LocalDateTime;

import com.mck.collab.project.entity.Project;

import lombok.Getter;

@Getter
public class ProjectResponse {

    private final String id;
    private final String name;
    private final String description;
    private final String ownerUserId;
    private final String ownerNickname;
    private final int memberCount;
    private final LocalDateTime createdAt;

    public ProjectResponse(Project project, int memberCount) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.ownerUserId = project.getOwner().getUserId();
        this.ownerNickname = project.getOwner().getNickname();
        this.memberCount = memberCount;
        this.createdAt = project.getCreatedAt();
    }
}
