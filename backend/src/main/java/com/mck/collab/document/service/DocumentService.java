package com.mck.collab.document.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mck.collab.document.dto.DocumentCreateRequest;
import com.mck.collab.document.dto.DocumentResponse;
import com.mck.collab.document.entity.Document;
import com.mck.collab.document.repository.DocumentRepository;
import com.mck.collab.member.entity.Member;
import com.mck.collab.member.repository.MemberRepository;
import com.mck.collab.project.repository.ProjectMemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final MemberRepository memberRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Transactional
    public DocumentResponse createDocument(String userId, DocumentCreateRequest request) {
        Member owner = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        Document document = Document.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .tags(request.getTags())
                .owner(owner)
                .build();
        return new DocumentResponse(documentRepository.save(document));
    }

    public DocumentResponse getDocument(String id) {
        return new DocumentResponse(documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문서입니다.")));
    }

    public List<DocumentResponse> getMyDocuments(String userId) {
        return documentRepository.findByOwnerUserIdOrderByUpdatedAtDesc(userId)
                .stream().map(DocumentResponse::new).collect(Collectors.toList());
    }

    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAllByOrderByUpdatedAtDesc()
                .stream().map(DocumentResponse::new).collect(Collectors.toList());
    }

    // 공유된 문서 목록 (내가 속한 프로젝트 내 공유 문서만)
    public List<DocumentResponse> getSharedDocuments(String userId) {
        return documentRepository.findSharedInUserProjects(userId)
                .stream().map(DocumentResponse::new).collect(Collectors.toList());
    }

    // 코드 스니펫
    public List<DocumentResponse> getCodeSnippets(String userId) {
        return documentRepository.findCodeSnippetsByOwner(userId)
                .stream().map(DocumentResponse::new).collect(Collectors.toList());
    }

    // 즐겨찾기
    public List<DocumentResponse> getStarredDocuments(String userId) {
        return documentRepository.findStarredByOwner(userId)
                .stream().map(DocumentResponse::new).collect(Collectors.toList());
    }

    // 최근 열람
    public List<DocumentResponse> getRecentDocuments(String userId) {
        return documentRepository.findTop20ByOwnerUserIdOrderByUpdatedAtDesc(userId)
                .stream().map(DocumentResponse::new).collect(Collectors.toList());
    }

    // 검색
    public List<DocumentResponse> searchDocuments(String userId, String q) {
        if (q == null || q.isBlank()) return List.of();
        return documentRepository.searchDocuments(userId, q.trim())
                .stream().map(DocumentResponse::new).collect(Collectors.toList());
    }

    // 리뷰 요청
    public List<DocumentResponse> getReviewDocuments(String userId) {
        return documentRepository.findReviewDocuments(userId)
                .stream().map(DocumentResponse::new).collect(Collectors.toList());
    }

    @Transactional
    public DocumentResponse updateDocument(String id, String userId, DocumentCreateRequest request) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문서입니다."));
        boolean isOwner = doc.getOwner().getUserId().equals(userId);
        boolean isProjectMember = doc.getProject() != null &&
                projectMemberRepository.existsByProjectAndMemberUserId(doc.getProject(), userId);
        if (!isOwner && !isProjectMember)
            throw new IllegalArgumentException("문서를 수정할 권한이 없습니다.");
        doc.setTitle(request.getTitle());
        doc.setContent(request.getContent());
        doc.setTags(request.getTags());
        doc.setUpdatedAt(LocalDateTime.now());
        return new DocumentResponse(doc);
    }

    // 공유 토글
    @Transactional
    public DocumentResponse toggleShare(String id, String userId) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문서입니다."));
        if (!doc.getOwner().getUserId().equals(userId))
            throw new IllegalArgumentException("문서를 공유할 권한이 없습니다.");
        doc.setIsShared("Y".equals(doc.getIsShared()) ? "N" : "Y");
        doc.setUpdatedAt(LocalDateTime.now());
        return new DocumentResponse(doc);
    }

    // 즐겨찾기 토글 (tags에 'starred' 추가/제거)
    @Transactional
    public DocumentResponse toggleStar(String id, String userId) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문서입니다."));
        if (!doc.getOwner().getUserId().equals(userId))
            throw new IllegalArgumentException("권한이 없습니다.");
        String tags = doc.getTags() == null ? "" : doc.getTags();
        if (tags.contains("starred")) {
            tags = tags.replace("starred", "").replaceAll(",+", ",").replaceAll("^,|,$", "").trim();
        } else {
            tags = tags.isEmpty() ? "starred" : tags + ",starred";
        }
        doc.setTags(tags);
        doc.setUpdatedAt(LocalDateTime.now());
        return new DocumentResponse(doc);
    }

    @Transactional
    public void deleteDocument(String id, String userId) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문서입니다."));
        if (!doc.getOwner().getUserId().equals(userId))
            throw new IllegalArgumentException("문서를 삭제할 권한이 없습니다.");
        documentRepository.delete(doc);
    }
}
