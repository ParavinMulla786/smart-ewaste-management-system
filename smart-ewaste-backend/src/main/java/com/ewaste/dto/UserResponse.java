package com.ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for User Response
 * 
 * This DTO is used to send user information to the frontend.
 * NEVER includes the password field for security reasons.
 * 
 * Used in:
 * - POST /api/auth/register (response)
 * - POST /api/auth/login (response)
 * - GET /api/user/profile (response)
 * - PUT /api/user/update (response)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    /**
     * User's unique identifier
     */
    private String id;

    /**
     * User's full name
     */
    private String name;

    /**
     * User's email address
     */
    private String email;

    /**
     * User's phone number
     */
    private String phone;

    /**
     * User's address
     */
    private String address;

    /**
     * User's avatar
     */
    private String avatar;

    /**
     * User's profile image URL (S3)
     */
    private String profileImageUrl;

    /**
     * User's created date
     */
    private java.time.LocalDateTime createdAt;

    /**
     * Constructor from User entity
     * Excludes password for security
     */
    public static UserResponse fromUser(com.ewaste.model.User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setAvatar(user.getAvatar());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
