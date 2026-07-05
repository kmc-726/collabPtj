package com.mck.collab.project.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mck.collab.document.dto.DocumentResponse;
import com.mck.collab.document.entity.Document;
import com.mck.collab.document.repository.DocumentRepository;
import com.mck.collab.member.entity.Member;
import com.mck.collab.member.repository.MemberRepository;
import com.mck.collab.project.dto.ProjectCreateRequest;
import com.mck.collab.project.dto.ProjectDetailResponse;
import com.mck.collab.project.dto.ProjectMemberResponse;
import com.mck.collab.project.dto.ProjectResponse;
import com.mck.collab.project.entity.Project;
import com.mck.collab.project.entity.ProjectMember;
import com.mck.collab.project.entity.ProjectRole;
import com.mck.collab.project.repository.ProjectMemberRepository;
import com.mck.collab.project.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final MemberRepository memberRepository;
    private final DocumentRepository documentRepository;

    @Transactional
    public ProjectResponse createProject(String userId, ProjectCreateRequest request) {
        Member owner = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
                .build();
        projectRepository.save(project);

        // 생성자를 OWNER로 추가
        ProjectMember ownerMember = ProjectMember.builder()
                .project(project)
                .member(owner)
                .role(ProjectRole.OWNER)
                .build();
        projectMemberRepository.save(ownerMember);

        // 초대 멤버 추가
        if (request.getMemberUserIds() != null) {
            for (String memberId : request.getMemberUserIds()) {
                if (memberId.equals(userId)) continue;
                memberRepository.findByUserId(memberId).ifPresent(m -> {
                    ProjectMember pm = ProjectMember.builder()
                            .project(project)
                            .member(m)
                            .role(ProjectRole.MEMBER)
                            .build();
                    projectMemberRepository.save(pm);
                });
            }
        }

        int memberCount = projectMemberRepository.findByProject(project).size();
        return new ProjectResponse(project, memberCount);
    }

    public List<ProjectResponse> getMyProjects(String userId) {
        return projectRepository.findByMemberUserId(userId).stream()
                .map(p -> {
                    int count = projectMemberRepository.findByProject(p).size();
                    return new ProjectResponse(p, count);
                })
                .collect(Collectors.toList());
    }

    public ProjectDetailResponse getProjectDetail(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로젝트입니다."));

        if (!projectMemberRepository.existsByProjectAndMemberUserId(project, userId)) {
            throw new IllegalArgumentException("프로젝트에 접근할 권한이 없습니다.");
        }

        List<ProjectMemberResponse> members = projectMemberRepository.findByProject(project).stream()
                .map(ProjectMemberResponse::new)
                .collect(Collectors.toList());

        List<DocumentResponse> documents = documentRepository.findByProjectIdOrderByUpdatedAtDesc(projectId).stream()
                .map(DocumentResponse::new)
                .collect(Collectors.toList());

        return new ProjectDetailResponse(project, members, documents);
    }

    @Transactional
    public void inviteMember(String projectId, String requesterId, String targetUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로젝트입니다."));

        ProjectMember requester = projectMemberRepository.findByProjectAndMemberUserId(project, requesterId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트에 접근할 권한이 없습니다."));

        if (requester.getRole() != ProjectRole.OWNER) {
            throw new IllegalArgumentException("프로젝트 소유자만 구성원을 초대할 수 있습니다.");
        }

        if (projectMemberRepository.existsByProjectAndMemberUserId(project, targetUserId)) {
            throw new IllegalArgumentException("이미 프로젝트 구성원입니다.");
        }

        Member target = memberRepository.findByUserId(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ProjectMember pm = ProjectMember.builder()
                .project(project)
                .member(target)
                .role(ProjectRole.MEMBER)
                .build();
        projectMemberRepository.save(pm);
    }

    @Transactional
    public void removeMember(String projectId, String requesterId, String targetUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로젝트입니다."));

        boolean isSelfLeave = requesterId.equals(targetUserId);

        if (!isSelfLeave) {
            ProjectMember requester = projectMemberRepository.findByProjectAndMemberUserId(project, requesterId)
                    .orElseThrow(() -> new IllegalArgumentException("프로젝트에 접근할 권한이 없습니다."));
            if (requester.getRole() != ProjectRole.OWNER) {
                throw new IllegalArgumentException("프로젝트 소유자만 구성원을 제거할 수 있습니다.");
            }
        }

        if (!projectMemberRepository.existsByProjectAndMemberUserId(project, targetUserId)) {
            throw new IllegalArgumentException("해당 구성원이 존재하지 않습니다.");
        }

        // OWNER는 스스로 나갈 수 없음
        if (isSelfLeave) {
            ProjectMember self = projectMemberRepository.findByProjectAndMemberUserId(project, requesterId)
                    .orElseThrow(() -> new IllegalArgumentException("프로젝트 구성원이 아닙니다."));
            if (self.getRole() == ProjectRole.OWNER) {
                throw new IllegalArgumentException("프로젝트 소유자는 프로젝트를 나갈 수 없습니다. 프로젝트를 삭제해 주세요.");
            }
        }

        projectMemberRepository.deleteByProjectAndMemberUserId(project, targetUserId);
    }

    @Transactional
    public DocumentResponse addDocument(String projectId, String docId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로젝트입니다."));

        if (!projectMemberRepository.existsByProjectAndMemberUserId(project, userId)) {
            throw new IllegalArgumentException("프로젝트에 접근할 권한이 없습니다.");
        }

        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문서입니다."));

        if (!doc.getOwner().getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 문서만 프로젝트에 추가할 수 있습니다.");
        }

        doc.setProject(project);
        return new DocumentResponse(doc);
    }

    @Transactional
    public void removeDocument(String projectId, String docId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로젝트입니다."));

        if (!projectMemberRepository.existsByProjectAndMemberUserId(project, userId)) {
            throw new IllegalArgumentException("프로젝트에 접근할 권한이 없습니다.");
        }

        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문서입니다."));

        if (!doc.getOwner().getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 문서만 프로젝트에서 제거할 수 있습니다.");
        }

        doc.setProject(null);
    }

    @Transactional
    public void deleteProject(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로젝트입니다."));

        if (!project.getOwner().getUserId().equals(userId)) {
            throw new IllegalArgumentException("프로젝트 소유자만 삭제할 수 있습니다.");
        }

        // 프로젝트에 속한 문서들의 프로젝트 참조 해제
        List<Document> docs = documentRepository.findByProjectIdOrderByUpdatedAtDesc(projectId);
        docs.forEach(d -> d.setProject(null));

        // 멤버 먼저 삭제
        projectMemberRepository.findByProject(project).forEach(projectMemberRepository::delete);

        projectRepository.delete(project);
    }
}
