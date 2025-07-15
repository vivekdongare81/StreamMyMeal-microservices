package com.devsoncall.streammymeal.users.dto.resetPassword;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetResponse {
    private String message;
    private boolean success;
}