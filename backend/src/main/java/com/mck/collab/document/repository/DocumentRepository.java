package com.mck.collab.document.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mck.collab.document.entity.Document;
import com.mck.collab.project.entity.ProjectMember;

public interface DocumentRepository extends JpaRepository<Document, String> {
    List<Document> findByOwnerUserIdOrderByUpdatedAtDesc(String userId);
    List<Document> findAllByOrderByUpdatedAtDesc();
    long countByOwnerUserId(String userId);
    long countByOwnerUserIdAndIsShared(String userId, String isShared);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.owner.userId = :userId AND d.tags LIKE CONCAT('%', :tag, '%')")
    long countByOwnerUserIdAndTagsContaining(@Param("userId") String userId, @Param("tag") String tag);
    
    List<Document> findTop5ByOwnerUserIdOrderByUpdatedAtDesc(String userId);

    // 공유된 문서 목록 (내가 속한 프로젝트의 문서만)
    @Query("SELECT d FROM Document d WHERE d.isShared = 'Y' " +
           "AND d.project IS NOT NULL " +
           "AND d.project.id IN (" +
           "  SELECT pm.project.id FROM ProjectMember pm WHERE pm.member.userId = :userId" +
           ") " +
           "ORDER BY d.updatedAt DESC")
    List<Document> findSharedInUserProjects(@Param("userId") String userId);

    // 코드 스니펫 (tags에 'code' 포함)
@Query("SELECT d FROM Document d WHERE d.owner.userId = :userId AND d.tags LIKE '%code%' ORDER BY d.updatedAt DESC")
    List<Document> findCodeSnippetsByOwner(@Param("userId") String userId);

    // 즐겨찾기 (tags에 'starred' 포함)
@Query("SELECT d FROM Document d WHERE d.owner.userId = :userId AND d.tags LIKE '%starred%' ORDER BY d.updatedAt DESC")
    List<Document> findStarredByOwner(@Param("userId") String userId);

    // 최근 열람 (updatedAt 기준 최근 20개)
    List<Document> findTop20ByOwnerUserIdOrderByUpdatedAtDesc(String userId);

    // 검색 (내 문서 + 공유 문서, 제목/내용 기준)
    @Query("SELECT d FROM Document d WHERE (d.owner.userId = :userId OR d.isShared = 'Y') " +
           "AND (LOWER(d.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(d.content) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "ORDER BY d.updatedAt DESC")
    List<Document> searchDocuments(@Param("userId") String userId, @Param("q") String q);

    // 리뷰 요청: 내 공유 문서 중 미해결 댓글이 있는 것
    @Query("SELECT d FROM Document d WHERE d.owner.userId = :userId AND d.isShared = 'Y' " +
           "AND EXISTS (SELECT c FROM AppComment c WHERE c.document = d AND c.isResolved = 'N') " +
           "ORDER BY d.updatedAt DESC")
    List<Document> findReviewDocuments(@Param("userId") String userId);

    // 프로젝트에 속한 문서 목록
    List<Document> findByProjectIdOrderByUpdatedAtDesc(String projectId);
}
