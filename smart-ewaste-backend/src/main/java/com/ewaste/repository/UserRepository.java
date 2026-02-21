package com.ewaste.repository;

import com.ewaste.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * User Repository Interface
 * 
 * Extends MongoRepository to provide CRUD operations for User entity.
 * Spring Data MongoDB automatically implements this interface.
 * 
 * MongoRepository<User, String>:
 * - User: Entity type
 * - String: ID type (MongoDB ObjectId stored as String)
 * 
 * Automatically provides:
 * - save()
 * - findById()
 * - findAll()
 * - deleteById()
 * - count()
 * - exists()
 * - and more...
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Find user by email address
     * 
     * Custom query method - Spring Data MongoDB generates implementation
     * from method name.
     * 
     * @param email User's email address
     * @return Optional<User> - empty if not found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists with given email
     * 
     * Custom query method - returns boolean
     * Useful for checking email uniqueness during registration
     * 
     * @param email Email to check
     * @return true if user exists, false otherwise
     */
    Boolean existsByEmail(String email);

    /**
     * Find user by verification token
     * 
     * Used during email verification and password setup
     * 
     * @param verificationToken Verification token
     * @return Optional<User> - empty if not found
     */
    Optional<User> findByVerificationToken(String verificationToken);
    
    /**
     * Find users by role
     * 
     * @param role User role (USER or ADMIN)
     * @return List of users with the specified role
     */
    java.util.List<User> findByRole(String role);
    
    /**
     * Find users by blocked status
     * 
     * @param blocked Blocked status
     * @return List of users with the specified blocked status
     */
    java.util.List<User> findByBlocked(boolean blocked);
}
