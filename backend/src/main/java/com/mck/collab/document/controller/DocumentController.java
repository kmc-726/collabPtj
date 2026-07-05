package com.mck.collab.document.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mck.collab.document.dto.DocumentCreateRequest;
import com.mck.collab.document.dto.DocumentResponse;
import com.mck.collab.document.dto.DocumentUpdateRequest;
import com.mck.collab.document.service.DocumentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    public ResponseEntity<DocumentResponse> createDocument(
            Authentication authentication,
            @Valid @RequestBody DocumentCreateRequest request
    ) {
        return ResponseEntity.ok(documentService.createDocument(getUserId(authentication), request));
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getMyDocuments(Authentication authentication) {
        return ResponseEntity.ok(documentService.getMyDocuments(getUserId(authentication)));
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentResponse> getMyDocument(
            Authentication authentication,
            @PathVariable String documentId
    ) {
        return ResponseEntity.ok(documentService.getMyDocument(getUserId(authentication), documentId));
    }

    @PatchMapping("/{documentId}")
    public ResponseEntity<DocumentResponse> updateDocument(
            Authentication authentication,
            @PathVariable String documentId,
            @Valid @RequestBody DocumentUpdateRequest request
    ) {
        return ResponseEntity.ok(documentService.updateDocument(getUserId(authentication), documentId, request));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            Authentication authentication,
            @PathVariable String documentId
    ) {
        documentService.deleteDocument(getUserId(authentication), documentId);
        return ResponseEntity.ok(Map.of("message", "문서가 삭제되었습니다."));
    }

    private String getUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        return authentication.getName();
    }
}
