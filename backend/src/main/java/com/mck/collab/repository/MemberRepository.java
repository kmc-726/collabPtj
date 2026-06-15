package com.mck.collab.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mck.collab.entity.Member;

// JpaRepository<다룰 엔티티 클래스, 그 엔티티의 PK(ID) 데이터 타입>
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    // 💡 나중에 회원가입/로그인할 때 써먹을 커스텀 탐색 기능들을 미리 선언해 둡니다.
    // 1. 이메일이나 유저 ID가 이미 DB에 존재하는지 중복 체크
    boolean existsByEmail(String email);
    boolean existsByUserId(String userId);

    // 2. 로그인할 때 유저 ID로 회원 정보를 통째로 찾아오기
    Optional<Member> findByUserId(String userId);
    
    // 3. 구글/소셜 로그인할 때 이메일로 기존 회원 정보를 통째로 찾아오기
    Optional<Member> findByEmail(String email);
}