package com.mck.collab.dashboard.dto;

import java.time.LocalDateTime;

import com.mck.collab.comment.entity.AppComment;

import lombok.Getter;

@Getter
public class ActivityResponse {

    private final String actorNickname;
    private final String targetDocumentTitle;
    private final String documentId;
    private final String type;  // "comment"
    private final LocalDateTime createdAt;

    public ActivityResponse(AppComment comment) {
        this.actorNickname = comment.getWriter().getNickname();
        this.targetDocumentTitle = comment.getDocument().getTitle();
        this.documentId = comment.getDocument().getId();
        this.type = "comment";
        this.createdAt = comment.getCreatedAt();
    }
}
