package com.mck.collab.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mck.collab.entity.AppComment;

public interface AppCommentRepository extends JpaRepository<AppComment, Long> {
}