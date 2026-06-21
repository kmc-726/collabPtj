package com.mck.collab.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mck.collab.auth.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

}
