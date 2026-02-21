package com.ewaste.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * PickupPerson Entity
 * Represents a person who collects e-waste
 */
@Document(collection = "pickup_persons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PickupPerson {

    @Id
    private String id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(min = 10, max = 15, message = "Phone number must be between 10 and 15 characters")
    private String phone;

    // Password (BCrypt hashed)
    private String password;

    // Address/Area of operation
    private String area;

    // Vehicle details
    private String vehicleNumber;
    private String vehicleType;

    // Employment status
    private boolean isActive = true;

    // Temporary password flag - requires password change on first login
    private boolean isTemporaryPassword = false;

    // Role for authentication
    private String role = "PICKUP_PERSON";

    // Statistics
    private Integer totalPickupsCompleted = 0;
    private Integer totalPickupsPending = 0;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
