package com.mck.collab.comment.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mck.collab.comment.dto.CommentRequest;
import com.mck.collab.comment.dto.CommentResponse;
import com.mck.collab.comment.service.CommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // 댓글 작성
    @PostMapping
    public ResponseEntity<CommentResponse> create(
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.createComment(authentication.getName(), request));
    }

    // 문서 전체 댓글 조회
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getByDocument(
            @RequestParam("documentId") String documentId) {
        return ResponseEntity.ok(commentService.getCommentsByDocument(documentId));
    }

    // 특정 블록 댓글 조회
    @GetMapping("/block")
    public ResponseEntity<List<CommentResponse>> getByBlock(
            @RequestParam("documentId") String documentId,
            @RequestParam("blockId") String blockId) {
        return ResponseEntity.ok(commentService.getCommentsByBlock(documentId, blockId));
    }

    // 댓글 해결 처리
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<CommentResponse> resolve(
            @PathVariable("id") Long id,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.resolveComment(id, authentication.getName()));
    }

    // 댓글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") Long id,
            Authentication authentication) {
        commentService.deleteComment(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
