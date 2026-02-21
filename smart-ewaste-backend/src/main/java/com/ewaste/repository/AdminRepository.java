package com.ewaste.repository;

import com.ewaste.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Admin Repository
 */
@Repository
public interface AdminRepository extends MongoRepository<Admin, String> {
    
    /**
     * Find admin by email
     */
    Optional<Admin> findByEmail(String email);
    
    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);
}
