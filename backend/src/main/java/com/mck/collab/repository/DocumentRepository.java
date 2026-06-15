package com.mck.collab.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mck.collab.entity.Document;

public interface DocumentRepository extends JpaRepository<Document, String> {
    
    // 기본 CRUD(저장, 조회, 수정, 삭제)는 JpaRepository가 알아서 다 제공합니다.
    // 여기는 일단 비워두셔도 완벽하게 작동합니다!
}