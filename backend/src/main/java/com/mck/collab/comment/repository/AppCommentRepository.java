package com.mck.collab.comment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mck.collab.comment.entity.AppComment;

public interface AppCommentRepository extends JpaRepository<AppComment, Long> {
}
