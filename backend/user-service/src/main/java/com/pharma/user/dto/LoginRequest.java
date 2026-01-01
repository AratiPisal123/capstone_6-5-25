package com.pharma.user.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Email or mobile is required")
    @JsonAlias({"email", "mobile"})
    private String emailOrMobile;

    @NotBlank(message = "Password is required")
    private String password;

    private Boolean rememberMe = false;
}
