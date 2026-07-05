package com.mck.collab.dashboard.dto;

import java.util.List;

import com.mck.collab.document.dto.DocumentResponse;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardResponse {

    // 통계 카드
    private final long myDocuments;
    private final long sharedDocuments;
    private final long codeSnippets;
    private final long pendingReviews;

    // 최근 문서 5개
    private final List<DocumentResponse> recentDocuments;

    // 최근 활동 피드
    private final List<ActivityResponse> recentActivities;
}
