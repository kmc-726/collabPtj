package com.mck.collab.document.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.mck.collab.document.dto.DocumentCreateRequest;
import com.mck.collab.document.dto.DocumentResponse;
import com.mck.collab.document.service.DocumentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    public ResponseEntity<DocumentResponse> create(@Valid @RequestBody DocumentCreateRequest request, Authentication auth) {
        return ResponseEntity.ok(documentService.createDocument(auth.getName(), request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<DocumentResponse>> getMyDocuments(Authentication auth) {
        return ResponseEntity.ok(documentService.getMyDocuments(auth.getName()));
    }

    @GetMapping("/shared")
    public ResponseEntity<List<DocumentResponse>> getSharedDocuments(Authentication auth) {
        return ResponseEntity.ok(documentService.getSharedDocuments(auth.getName()));
    }

    @GetMapping("/snippets")
    public ResponseEntity<List<DocumentResponse>> getCodeSnippets(Authentication auth) {
        return ResponseEntity.ok(documentService.getCodeSnippets(auth.getName()));
    }

    @GetMapping("/starred")
    public ResponseEntity<List<DocumentResponse>> getStarred(Authentication auth) {
        return ResponseEntity.ok(documentService.getStarredDocuments(auth.getName()));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<DocumentResponse>> getRecent(Authentication auth) {
        return ResponseEntity.ok(documentService.getRecentDocuments(auth.getName()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<DocumentResponse>> search(@RequestParam("q") String q, Authentication auth) {
        return ResponseEntity.ok(documentService.searchDocuments(auth.getName(), q));
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<DocumentResponse>> getReviewDocuments(Authentication auth) {
        return ResponseEntity.ok(documentService.getReviewDocuments(auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable("id") String id) {
        return ResponseEntity.ok(documentService.getDocument(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponse> update(@PathVariable("id") String id, @Valid @RequestBody DocumentCreateRequest request, Authentication auth) {
        return ResponseEntity.ok(documentService.updateDocument(id, auth.getName(), request));
    }

    @PatchMapping("/{id}/share")
    public ResponseEntity<DocumentResponse> toggleShare(@PathVariable("id") String id, Authentication auth) {
        return ResponseEntity.ok(documentService.toggleShare(id, auth.getName()));
    }

    @PatchMapping("/{id}/star")
    public ResponseEntity<DocumentResponse> toggleStar(@PathVariable("id") String id, Authentication auth) {
        return ResponseEntity.ok(documentService.toggleStar(id, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id, Authentication auth) {
        documentService.deleteDocument(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
