package com.mck.collab.notification.dto;

import java.time.LocalDateTime;

import com.mck.collab.notification.entity.Notification;
import com.mck.collab.notification.entity.NotificationType;

import lombok.Getter;

@Getter
public class NotificationResponse {

    private final Long id;
    private final NotificationType type;
    private final String message;
    private final String documentId;
    private final String isRead;
    private final LocalDateTime createdAt;

    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getType();
        this.message = notification.getMessage();
        this.documentId = notification.getDocumentId();
        this.isRead = notification.getIsRead();
        this.createdAt = notification.getCreatedAt();
    }
}
