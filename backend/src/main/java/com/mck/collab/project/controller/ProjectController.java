package com.mck.collab.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mck.collab.document.dto.DocumentResponse;
import com.mck.collab.project.dto.ProjectCreateRequest;
import com.mck.collab.project.dto.ProjectDetailResponse;
import com.mck.collab.project.dto.ProjectResponse;
import com.mck.collab.project.service.ProjectService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @RequestBody ProjectCreateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.createProject(authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getMyProjects(Authentication authentication) {
        return ResponseEntity.ok(projectService.getMyProjects(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDetailResponse> getProjectDetail(
            @PathVariable String id,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.getProjectDetail(id, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(
            @PathVariable String id,
            Authentication authentication) {
        projectService.deleteProject(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "프로젝트가 삭제되었습니다."));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Map<String, String>> inviteMember(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String targetUserId = body.get("userId");
        if (targetUserId == null || targetUserId.isBlank()) {
            throw new IllegalArgumentException("초대할 사용자 ID를 입력해 주세요.");
        }
        projectService.inviteMember(id, authentication.getName(), targetUserId);
        return ResponseEntity.ok(Map.of("message", "구성원이 초대되었습니다."));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable String id,
            @PathVariable String userId,
            Authentication authentication) {
        projectService.removeMember(id, authentication.getName(), userId);
        return ResponseEntity.ok(Map.of("message", "구성원이 제거되었습니다."));
    }

    @PostMapping("/{id}/documents/{docId}")
    public ResponseEntity<DocumentResponse> addDocument(
            @PathVariable String id,
            @PathVariable String docId,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.addDocument(id, docId, authentication.getName()));
    }

    @DeleteMapping("/{id}/documents/{docId}")
    public ResponseEntity<Map<String, String>> removeDocument(
            @PathVariable String id,
            @PathVariable String docId,
            Authentication authentication) {
        projectService.removeDocument(id, docId, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "문서가 프로젝트에서 제거되었습니다."));
    }
}
