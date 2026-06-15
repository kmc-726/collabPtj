package com.mck.collab.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "APP_COMMENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppComment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "COMMENT_SEQ_GEN")
    @SequenceGenerator(name = "COMMENT_SEQ_GEN", sequenceName = "SEQ_COMMENT_ID", allocationSize = 1)
    private Long id;

    // UUID를 사용하는 Document와 연관관계 (내부적으로 VARCHAR2(36)과 매칭됨)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DOCUMENT_ID", nullable = false)
    private Document document;

    // 숫자형 PK를 사용하는 Member와 연관관계 (내부적으로 NUMBER(19,0)과 매칭됨)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private Member writer;

    @Column(name = "BLOCK_ID", nullable = false, length = 100)
    private String blockId;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(name = "IS_RESOLVED", nullable = false, length = 1)
    @Builder.Default
    private String isResolved = "N"; // 기본값 'N' 세팅

    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}