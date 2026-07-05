package com.mck.collab.document.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mck.collab.document.entity.Document;

public interface DocumentRepository extends JpaRepository<Document, String> {
    List<Document> findByOwnerUserIdOrderByUpdatedAtDesc(String userId);
    Optional<Document> findByIdAndOwnerUserId(String id, String userId);
}
