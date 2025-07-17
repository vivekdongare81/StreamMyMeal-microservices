package com.devsoncall.streammymeal.users.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    @JsonProperty("userId")
    private Integer userId;
    private String username;
    private String email;
    private String address;
    private String profileImageUrl;
    private String newJwtToken;

    @Override
    public String toString() {
        return "ProfileResponse{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", address='" + address + '\'' +
                ", profileImageUrl='" + profileImageUrl + '\'' +
                ", newJwtToken='" + newJwtToken + '\'' +
                '}';
    }
    public Integer getUserId() {
        return userId;
    }
}
