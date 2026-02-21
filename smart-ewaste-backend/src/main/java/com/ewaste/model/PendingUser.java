package com.ewaste.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * PendingUser Entity
 * 
 * Stores temporary user registration data before email verification
 * Once verified, data is moved to User collection
 */
@Data
@Document(collection = "pending_users")
public class PendingUser {
    
    @Id
    private String id;
    
    private String name;
    private String email;
    private String phone;
    private String address;
    
    private String verificationToken;
    private LocalDateTime verificationTokenExpiry;
    private LocalDateTime registrationDate;
    
    public PendingUser() {
        this.registrationDate = LocalDateTime.now();
    }
}
