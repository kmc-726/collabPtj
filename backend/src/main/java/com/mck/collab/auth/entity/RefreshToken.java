package com.mck.collab.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Table(name = "REFRESH_TOKEN")
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @Column(name = "USER_ID", length = 100)
    private String userId;

    @Column(name = "TOKEN", length = 500)
    private String token;

    public void updateToken(String token) {
        this.token = token;
    }
}
