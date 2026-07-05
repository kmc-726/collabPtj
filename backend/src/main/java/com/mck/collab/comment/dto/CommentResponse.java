package com.mck.collab.comment.dto;

import java.time.LocalDateTime;

import com.mck.collab.comment.entity.AppComment;

import lombok.Getter;

@Getter
public class CommentResponse {

    private final Long id;
    private final String documentId;
    private final String blockId;
    private final String content;
    private final String isResolved;
    private final String writerNickname;
    private final String writerUserId;
    private final LocalDateTime createdAt;

    public CommentResponse(AppComment comment) {
        this.id = comment.getId();
        this.documentId = comment.getDocument().getId();
        this.blockId = comment.getBlockId();
        this.content = comment.getContent();
        this.isResolved = comment.getIsResolved();
        this.writerNickname = comment.getWriter().getNickname();
        this.writerUserId = comment.getWriter().getUserId();
        this.createdAt = comment.getCreatedAt();
    }
}
