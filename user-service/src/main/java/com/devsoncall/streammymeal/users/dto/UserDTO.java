package com.devsoncall.streammymeal.users.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class UserDTO {
    private Integer userId;
    private String username;
    private String email;
    private String address;
    private String profileImageName;
    private Set<String> roles;
    private boolean isActive;
}
