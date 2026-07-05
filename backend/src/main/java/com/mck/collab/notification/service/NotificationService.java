package com.mck.collab.notification.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mck.collab.member.entity.Member;
import com.mck.collab.notification.dto.NotificationResponse;
import com.mck.collab.notification.entity.Notification;
import com.mck.collab.notification.entity.NotificationType;
import com.mck.collab.notification.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // 알림 생성 (내부 호출용)
    @Transactional
    public void createNotification(Member receiver, NotificationType type, String message, String documentId) {
        Notification notification = Notification.builder()
                .receiver(receiver)
                .type(type)
                .message(message)
                .documentId(documentId)
                .build();
        notificationRepository.save(notification);

        // WebSocket으로 실시간 푸시
        messagingTemplate.convertAndSend(
            "/topic/notifications/" + receiver.getUserId(),
            new NotificationResponse(notification)
        );
    }

    // 내 알림 목록 조회
    public List<NotificationResponse> getMyNotifications(String userId) {
        return notificationRepository.findByReceiverUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
    }

    // 읽지 않은 알림 개수
    public long getUnreadCount(String userId) {
        return notificationRepository.countByReceiverUserIdAndIsRead(userId, "N");
    }

    // 알림 읽음 처리
    @Transactional
    public void markAsRead(Long notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 알림입니다."));

        if (!notification.getReceiver().getUserId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }

        notification.setIsRead("Y");
    }

    // 전체 읽음 처리
    @Transactional
    public void markAllAsRead(String userId) {
        notificationRepository.findByReceiverUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> "N".equals(n.getIsRead()))
                .forEach(n -> n.setIsRead("Y"));
    }

    // 알림 삭제
    @Transactional
    public void deleteNotification(Long notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 알림입니다."));

        if (!notification.getReceiver().getUserId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }

        notificationRepository.delete(notification);
    }
}
