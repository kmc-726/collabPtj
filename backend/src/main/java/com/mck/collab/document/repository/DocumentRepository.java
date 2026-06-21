package com.mck.collab.document.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mck.collab.document.entity.Document;

public interface DocumentRepository extends JpaRepository<Document, String> {
}
