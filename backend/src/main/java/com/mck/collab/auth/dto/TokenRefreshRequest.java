package com.mck.collab.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenRefreshRequest {
    @NotBlank(message = "Refresh Token 은 필수입니다.")
    private String refreshToken;
}
