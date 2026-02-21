package com.ewaste.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for resetting password
 */
@Data
public class ResetPasswordRequest {
    
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Current password is required")
    private String oldPassword;
    
    @NotBlank(message = "New password is required")
    private String newPassword;
}
