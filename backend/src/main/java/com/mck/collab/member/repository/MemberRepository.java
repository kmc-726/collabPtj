package com.mck.collab.member.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mck.collab.member.entity.Member;

public interface MemberRepository extends JpaRepository<Member, Long> {
    boolean existsByEmail(String email);
    boolean existsByUserId(String userId);
    Optional<Member> findByUserId(String userId);
    Optional<Member> findByEmail(String email);
}
