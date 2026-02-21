package com.ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for User Registration
 * 
 * This DTO is used to receive registration data from the frontend.
 * It includes validation constraints to ensure data integrity.
 * 
 * Used in: POST /api/auth/register
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    /**
     * User's full name
     */
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    /**
     * User's email address
     * Must be a valid email format
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    /**
     * User's phone number
     */
    @NotBlank(message = "Phone number is required")
    @Size(min = 10, max = 15, message = "Phone number must be between 10 and 15 digits")
    private String phone;

    /**
     * User's address (optional)
     * Can be provided during registration or updated later
     */
    private String address;
}
