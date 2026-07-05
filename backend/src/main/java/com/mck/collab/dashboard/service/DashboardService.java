package com.mck.collab.dashboard.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mck.collab.comment.repository.AppCommentRepository;
import com.mck.collab.dashboard.dto.ActivityResponse;
import com.mck.collab.dashboard.dto.DashboardResponse;
import com.mck.collab.document.dto.DocumentResponse;
import com.mck.collab.document.repository.DocumentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final DocumentRepository documentRepository;
    private final AppCommentRepository commentRepository;

    public DashboardResponse getDashboard(String userId) {

        // 통계
        long myDocuments = documentRepository.countByOwnerUserId(userId);
        long sharedDocuments = documentRepository.countByOwnerUserIdAndIsShared(userId, "Y");
        long codeSnippets = documentRepository.countByOwnerUserIdAndTagsContaining(userId, "code");
        long pendingReviews = commentRepository.countUnresolvedByDocumentOwner(userId);

        // 최근 문서 5개
        List<DocumentResponse> recentDocuments = documentRepository
                .findTop5ByOwnerUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(DocumentResponse::new)
                .collect(Collectors.toList());

        // 최근 활동 5개
        List<ActivityResponse> recentActivities = commentRepository
                .findRecentActivitiesByDocumentOwner(userId, PageRequest.of(0, 5))
                .stream()
                .map(ActivityResponse::new)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .myDocuments(myDocuments)
                .sharedDocuments(sharedDocuments)
                .codeSnippets(codeSnippets)
                .pendingReviews(pendingReviews)
                .recentDocuments(recentDocuments)
                .recentActivities(recentActivities)
                .build();
    }
}
