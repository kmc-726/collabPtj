package com.mck.collab.document.dto;

import java.time.LocalDateTime;
import com.mck.collab.document.entity.Document;
import lombok.Getter;

@Getter
public class DocumentResponse {

    private final String id;
    private final String title;
    private final String content;
    private final String tags;
    private final String isShared;
    private final String ownerNickname;
    private final String ownerUserId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final String projectId;
    private final String projectName;

    public DocumentResponse(Document doc) {
        this.id = doc.getId();
        this.title = doc.getTitle();
        this.content = doc.getContent();
        this.tags = doc.getTags();
        this.isShared = doc.getIsShared();
        this.ownerNickname = doc.getOwner().getNickname();
        this.ownerUserId = doc.getOwner().getUserId();
        this.createdAt = doc.getCreatedAt();
        this.updatedAt = doc.getUpdatedAt();
        this.projectId = doc.getProject() != null ? doc.getProject().getId() : null;
        this.projectName = doc.getProject() != null ? doc.getProject().getName() : null;
    }
}
