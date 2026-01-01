package com.pharma.user.dto;

import com.pharma.user.entity.UserRole;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String mobile;
    private UserRole role;
    private Boolean emailVerified;
    private Boolean mobileVerified;
    private String profileImage;
}
