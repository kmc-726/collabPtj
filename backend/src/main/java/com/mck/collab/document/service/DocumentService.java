package com.mck.collab.document.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mck.collab.document.dto.DocumentCreateRequest;
import com.mck.collab.document.dto.DocumentResponse;
import com.mck.collab.document.dto.DocumentUpdateRequest;
import com.mck.collab.document.entity.Document;
import com.mck.collab.document.repository.DocumentRepository;
import com.mck.collab.member.entity.Member;
import com.mck.collab.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final MemberRepository memberRepository;

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

        return DocumentResponse.from(documentRepository.save(document));
    }

    public List<DocumentResponse> getMyDocuments(String userId) {
        return documentRepository.findByOwnerUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(DocumentResponse::from)
                .toList();
    }

    public DocumentResponse getMyDocument(String userId, String documentId) {
        Document document = getOwnedDocument(userId, documentId);
        return DocumentResponse.from(document);
    }

    @Transactional
    public DocumentResponse updateDocument(String userId, String documentId, DocumentUpdateRequest request) {
        Document document = getOwnedDocument(userId, documentId);

        document.setTitle(request.getTitle());
        document.setContent(request.getContent());
        document.setTags(request.getTags());
        document.setUpdatedAt(LocalDateTime.now());

        return DocumentResponse.from(document);
    }

    @Transactional
    public void deleteDocument(String userId, String documentId) {
        Document document = getOwnedDocument(userId, documentId);
        documentRepository.delete(document);
    }

    private Document getOwnedDocument(String userId, String documentId) {
        return documentRepository.findByIdAndOwnerUserId(documentId, userId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없거나 접근 권한이 없습니다."));
    }
}
