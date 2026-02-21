package com.ewaste.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/**
 * Admin Entity - Represents an admin user in the system
 * 
 * MongoDB Collection: admins
 */
@Document(collection = "admins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    @Id
    private String id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    /**
     * Account enabled status
     * Can be disabled by super admin
     */
    private boolean enabled = true;

    /**
     * Role - always ADMIN
     */
    private String role = "ADMIN";

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * ID of the admin who created this admin
     */
    private String createdBy;

    public Admin(String name, String email, String password, String createdBy) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdBy = createdBy;
    }
}
