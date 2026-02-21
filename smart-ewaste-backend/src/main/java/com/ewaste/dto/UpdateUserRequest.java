package com.ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for Updating User Profile
 * 
 * This DTO is used to receive profile update data from the frontend.
 * Email cannot be changed (business rule).
 * Password update requires separate endpoint (not implemented in Week 1-2).
 * 
 * All fields are optional - only provided fields will be updated.
 * 
 * Used in: PUT /api/user/update
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    /**
     * Updated name (optional)
     */
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    /**
     * Updated phone number (optional)
     */
    @Size(min = 10, max = 15, message = "Phone number must be between 10 and 15 digits")
    private String phone;

    /**
     * Updated address (optional)
     */
    private String address;

    /**
     * Updated avatar (optional)
     * Emoji or character representing profile picture
     */
    private String avatar;
}
