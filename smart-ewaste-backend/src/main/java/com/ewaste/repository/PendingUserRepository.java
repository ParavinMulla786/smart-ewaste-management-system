package com.ewaste.repository;

import com.ewaste.model.PendingUser;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * PendingUser Repository
 * 
 * MongoDB repository for pending user operations
 */
@Repository
public interface PendingUserRepository extends MongoRepository<PendingUser, String> {
    
    /**
     * Check if email exists in pending users
     */
    Boolean existsByEmail(String email);
    
    /**
     * Find pending user by email
     */
    Optional<PendingUser> findByEmail(String email);
    
    /**
     * Find pending user by verification token
     */
    Optional<PendingUser> findByVerificationToken(String token);
    
    /**
     * Delete pending user by email
     */
    void deleteByEmail(String email);
}
