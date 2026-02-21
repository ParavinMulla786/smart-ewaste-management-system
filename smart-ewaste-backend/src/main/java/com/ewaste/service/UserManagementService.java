package com.ewaste.service;

import com.ewaste.model.User;
import com.ewaste.model.PendingUser;
import com.ewaste.repository.UserRepository;
import com.ewaste.repository.PendingUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * User Management Service (Admin operations)
 */
@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final PendingUserRepository pendingUserRepository;
    private final EmailService emailService;

    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get user by ID
     */
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    /**
     * Block a user
     */
    @Transactional
    public User blockUser(String id) {
        User user = getUserById(id);
        user.setBlocked(true);
        return userRepository.save(user);
    }

    /**
     * Unblock a user
     */
    @Transactional
    public User unblockUser(String id) {
        User user = getUserById(id);
        user.setBlocked(false);
        return userRepository.save(user);
    }

    /**
     * Delete a user
     */
    @Transactional
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Get all blocked users
     */
    public List<User> getBlockedUsers() {
        return userRepository.findByBlocked(true);
    }

    /**
     * Get all active (non-blocked) users
     */
    public List<User> getActiveUsers() {
        return userRepository.findByBlocked(false);
    }

    /**
     * Get users by role
     */
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    /**
     * Get all pending users (awaiting admin approval)
     */
    public List<PendingUser> getPendingUsers() {
        return pendingUserRepository.findAll();
    }

    /**
     * Approve a pending user and send verification email
     */
    @Transactional
    public User approveUser(String id) {
        PendingUser pendingUser = pendingUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pending user not found with id: " + id));
        
        // Create new User from PendingUser using the constructor
        User user = new User(
            pendingUser.getName(),
            pendingUser.getEmail(),
            pendingUser.getPhone(),
            null, // password will be set via email verification
            pendingUser.getAddress()
        );
        
        // Set verification details
        user.setVerificationToken(pendingUser.getVerificationToken());
        user.setVerificationTokenExpiry(pendingUser.getVerificationTokenExpiry());
        user.setEmailVerified(false);
        user.setEnabled(false);
        user.setBlocked(false);
        user.setApprovedByAdmin(true);
        user.setRole("USER");
        
        // Save user to users collection
        User savedUser = userRepository.save(user);
        
        // Send verification email now that admin has approved
        emailService.sendVerificationEmail(
            savedUser.getEmail(),
            savedUser.getName(),
            savedUser.getVerificationToken()
        );
        
        // Remove from pending users collection
        pendingUserRepository.deleteById(id);
        
        return savedUser;
    }

    /**
     * Reject a pending user registration
     * 
     * @param id Pending user ID
     */
    @Transactional
    public void rejectUser(String id) {
        PendingUser pendingUser = pendingUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pending user not found with id: " + id));
        
        // Simply delete the pending user record
        pendingUserRepository.deleteById(id);
    }
}
