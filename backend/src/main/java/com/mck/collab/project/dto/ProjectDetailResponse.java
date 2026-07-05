package com.mck.collab.project.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.mck.collab.document.dto.DocumentResponse;
import com.mck.collab.project.entity.Project;

import lombok.Getter;

@Getter
public class ProjectDetailResponse {

    private final String id;
    private final String name;
    private final String description;
    private final String ownerUserId;
    private final String ownerNickname;
    private final List<ProjectMemberResponse> members;
    private final List<DocumentResponse> documents;
    private final LocalDateTime createdAt;

    public ProjectDetailResponse(Project project,
                                  List<ProjectMemberResponse> members,
                                  List<DocumentResponse> documents) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.ownerUserId = project.getOwner().getUserId();
        this.ownerNickname = project.getOwner().getNickname();
        this.members = members;
        this.documents = documents;
        this.createdAt = project.getCreatedAt();
    }
}
