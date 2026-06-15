package com.mck.collab.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mck.collab.entity.Document;
import com.mck.collab.repository.DocumentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 읽기 전용으로 세팅해 성능 최적화
public class DocumentService {

    private final DocumentRepository documentRepository;

    // 1. 새 문서 생성 (데이터 변경이 있으므로 따로 @Transactional 달아줌)
    @Transactional
    public Document createDocument(Document document) {
        return documentRepository.save(document);
    }

    // 2. 특정 문서 하나만 조회 (UUID 키를 사용해 검색)
    public Document getDocument(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문서입니다."));
    }

    // 3. 모든 문서 목록 조회
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }
}