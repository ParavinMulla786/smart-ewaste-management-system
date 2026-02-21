package com.ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for Setting Password via Email Verification
 * 
 * Used when user clicks email verification link and sets their password
 * 
 * Used in: POST /api/auth/set-password
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetPasswordRequest {

    /**
     * Verification token from email link
     */
    @NotBlank(message = "Verification token is required")
    private String token;

    /**
     * New password to set
     */
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    /**
     * Confirm password (must match password)
     */
    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;
}
