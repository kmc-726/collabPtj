package com.mck.collab.document.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mck.collab.document.entity.Document;
import com.mck.collab.document.repository.DocumentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;

    @Transactional
    public Document createDocument(Document document) {
        return documentRepository.save(document);
    }

    public Document getDocument(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문서입니다."));
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }
}
