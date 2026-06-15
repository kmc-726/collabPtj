package com.mck.collab.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mck.collab.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String>{

}
