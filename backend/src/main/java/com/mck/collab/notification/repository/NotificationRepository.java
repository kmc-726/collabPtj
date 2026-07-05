package com.mck.collab.notification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mck.collab.notification.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverUserIdOrderByCreatedAtDesc(String userId);
    long countByReceiverUserIdAndIsRead(String userId, String isRead);
}
