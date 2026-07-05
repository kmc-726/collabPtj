package com.mck.collab.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mck.collab.project.entity.Project;
import com.mck.collab.project.entity.ProjectMember;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProject(Project project);

    Optional<ProjectMember> findByProjectAndMemberUserId(Project project, String userId);

    boolean existsByProjectAndMemberUserId(Project project, String userId);

    void deleteByProjectAndMemberUserId(Project project, String userId);
}
