package com.mck.collab.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mck.collab.project.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, String> {

    @Query("SELECT DISTINCT p FROM Project p JOIN ProjectMember pm ON pm.project = p WHERE pm.member.userId = :userId")
    List<Project> findByMemberUserId(@Param("userId") String userId);
}
