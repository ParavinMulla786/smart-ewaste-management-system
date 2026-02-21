package com.ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for Login Response
 * 
 * This DTO is returned after successful authentication.
 * Contains JWT token and user information (without password).
 * 
 * Returned by: POST /api/auth/login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    /**
     * JWT token for authentication
     * Client should include this in Authorization header for subsequent requests
     * Format: Bearer <token>
     */
    private String token;

    /**
     * User information (without sensitive data)
     */
    private UserResponse user;
}
