package com.mck.collab.comment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mck.collab.comment.entity.AppComment;

public interface AppCommentRepository extends JpaRepository<AppComment, Long> {
    List<AppComment> findByDocumentIdOrderByCreatedAtAsc(String documentId);
    List<AppComment> findByDocumentIdAndBlockIdOrderByCreatedAtAsc(String documentId, String blockId);

    // 최근 활동 (내가 소유한 문서의 댓글 최근 10개)
    @Query("SELECT c FROM AppComment c WHERE c.document.owner.userId = :userId ORDER BY c.createdAt DESC")
    List<AppComment> findRecentActivitiesByDocumentOwner(@Param("userId") String userId,
            org.springframework.data.domain.Pageable pageable);

    // 미해결 댓글 수 (리뷰 요청으로 활용)
    @Query("SELECT COUNT(c) FROM AppComment c WHERE c.document.owner.userId = :userId AND c.isResolved = 'N'")
    long countUnresolvedByDocumentOwner(@Param("userId") String userId);
}
