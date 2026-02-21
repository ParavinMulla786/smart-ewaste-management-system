package com.ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for User Login
 * 
 * This DTO is used to receive login credentials from the frontend.
 * Only email and password are required for authentication.
 * 
 * Used in: POST /api/auth/login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    /**
     * User's email address
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    /**
     * User's password
     */
    @NotBlank(message = "Password is required")
    private String password;
}
