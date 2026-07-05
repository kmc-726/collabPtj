package com.mck.collab.comment.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mck.collab.comment.dto.CommentRequest;
import com.mck.collab.comment.dto.CommentResponse;
import com.mck.collab.comment.entity.AppComment;
import com.mck.collab.comment.repository.AppCommentRepository;
import com.mck.collab.document.entity.Document;
import com.mck.collab.document.repository.DocumentRepository;
import com.mck.collab.member.entity.Member;
import com.mck.collab.member.repository.MemberRepository;
import com.mck.collab.notification.entity.NotificationType;
import com.mck.collab.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final AppCommentRepository commentRepository;
    private final DocumentRepository documentRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;

    @Transactional
    public CommentResponse createComment(String userId, CommentRequest request) {
        Member writer = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Document document = documentRepository.findById(request.getDocumentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문서입니다."));

        AppComment comment = AppComment.builder()
                .document(document)
                .writer(writer)
                .blockId(request.getBlockId())
                .content(request.getContent())
                .parentId(request.getParentId())
                .build();

        commentRepository.save(comment);

        Member docOwner = document.getOwner();

        if (request.getParentId() != null) {
            // 대댓글: 부모 댓글 작성자에게 알림 (자기 자신 제외)
            commentRepository.findById(request.getParentId()).ifPresent(parent -> {
                Member parentWriter = parent.getWriter();
                if (!parentWriter.getUserId().equals(userId)) {
                    notificationService.createNotification(
                        parentWriter,
                        NotificationType.COMMENT_ON_MY_DOCUMENT,
                        writer.getNickname() + "님이 댓글에 답글을 달았어요.",
                        document.getId()
                    );
                }
            });
        } else {
            // 일반 댓글: 문서 작성자에게 알림 (자기 자신 제외)
            if (!docOwner.getUserId().equals(userId)) {
                notificationService.createNotification(
                    docOwner,
                    NotificationType.COMMENT_ON_MY_DOCUMENT,
                    writer.getNickname() + "님이 '" + document.getTitle() + "' 문서에 댓글을 달았어요.",
                    document.getId()
                );
            }
        }

        return new CommentResponse(comment);
    }

    public List<CommentResponse> getCommentsByDocument(String documentId) {
        return commentRepository.findByDocumentIdOrderByCreatedAtAsc(documentId)
                .stream()
                .map(CommentResponse::new)
                .collect(Collectors.toList());
    }

    public List<CommentResponse> getCommentsByBlock(String documentId, String blockId) {
        return commentRepository.findByDocumentIdAndBlockIdOrderByCreatedAtAsc(documentId, blockId)
                .stream()
                .map(CommentResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse resolveComment(Long commentId, String userId) {
        AppComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));

        Member writer = comment.getWriter();
        Member docOwner = comment.getDocument().getOwner();

        boolean isWriter = writer.getUserId().equals(userId);
        boolean isDocOwner = docOwner.getUserId().equals(userId);

        if (!isWriter && !isDocOwner) {
            throw new IllegalArgumentException("댓글을 해결할 권한이 없습니다.");
        }

        comment.setIsResolved("Y");

        // 문서 소유자가 해결한 경우 → 댓글 작성자에게 알림
        if (!isWriter) {
            notificationService.createNotification(
                writer,
                NotificationType.COMMENT_RESOLVED,
                "'" + comment.getDocument().getTitle() + "' 문서의 댓글이 해결 처리됐어요.",
                comment.getDocument().getId()
            );
        }

        return new CommentResponse(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, String userId) {
        AppComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));

        if (!comment.getWriter().getUserId().equals(userId)) {
            throw new IllegalArgumentException("댓글을 삭제할 권한이 없습니다.");
        }

        commentRepository.delete(comment);
    }
}
