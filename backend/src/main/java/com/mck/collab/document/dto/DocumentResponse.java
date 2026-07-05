package com.mck.collab.document.dto;

import java.time.LocalDateTime;

import com.mck.collab.document.entity.Document;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DocumentResponse {

    private String id;
    private String title;
    private String content;
    private String tags;
    private String ownerUserId;
    private String ownerNickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DocumentResponse from(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .title(document.getTitle())
                .content(document.getContent())
                .tags(document.getTags())
                .ownerUserId(document.getOwner().getUserId())
                .ownerNickname(document.getOwner().getNickname())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}
