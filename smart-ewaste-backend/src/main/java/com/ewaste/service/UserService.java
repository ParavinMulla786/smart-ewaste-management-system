package com.ewaste.service;

import com.ewaste.dto.*;
import com.ewaste.model.User;
import com.ewaste.model.PendingUser;
import com.ewaste.repository.UserRepository;
import com.ewaste.repository.PendingUserRepository;
import com.ewaste.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * User Service Layer
 * 
 * Contains business logic for user operations:
 * - User registration
 * - User login/authentication
 * - Profile retrieval
 * - Profile updates
 * 
 * Handles data transformation between DTOs and entities.
 * Manages password hashing and JWT generation.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PendingUserRepository pendingUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    /**
     * Register a new user (without password - email verification required)
     * 
     * Process:
     * 1. Check if email already exists in User or PendingUser collections
     * 2. Generate verification token
     * 3. Create PendingUser entity (temporary storage)
     * 4. Save to pending_users collection
     * 5. Send verification email
     * 6. Return success message
     * 
     * @param request RegisterRequest DTO
     * @return UserResponse DTO
     * @throws RuntimeException if email already exists
     */
    public UserResponse registerUser(RegisterRequest request) {
        
        // Check if email already exists in verified users
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        // Check if email already exists in pending users
        if (pendingUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered. Please check your inbox for the verification link.");
        }

        // Generate verification token (UUID)
        String verificationToken = UUID.randomUUID().toString();
        
        // Set token expiry to 24 hours from now
        LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(24);

        // Create PendingUser entity (temporary storage until verification)
        PendingUser pendingUser = new PendingUser();
        pendingUser.setName(request.getName());
        pendingUser.setEmail(request.getEmail());
        pendingUser.setPhone(request.getPhone());
        pendingUser.setAddress(request.getAddress());
        pendingUser.setVerificationToken(verificationToken);
        pendingUser.setVerificationTokenExpiry(tokenExpiry);

        // Save to pending_users collection (NOT users collection)
        PendingUser savedPendingUser = pendingUserRepository.save(pendingUser);

        // DO NOT send verification email yet - wait for admin approval

        // Return response with minimal data
        UserResponse response = new UserResponse();
        response.setName(savedPendingUser.getName());
        response.setEmail(savedPendingUser.getEmail());
        response.setPhone(savedPendingUser.getPhone());
        response.setAddress(savedPendingUser.getAddress());
        
        return response;
    }

    /**
     * Authenticate user and generate JWT token
     * 
     * Process:
     * 1. Find user by email
     * 2. Check if account is enabled and email verified
     * 3. Verify password using BCrypt
     * 4. Generate JWT token
     * 5. Return LoginResponse with token and user data
     * 
     * @param request LoginRequest DTO
     * @return LoginResponse DTO with JWT token
     * @throws RuntimeException if credentials are invalid or account not verified
     */
    public LoginResponse loginUser(LoginRequest request) {
        
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Check if email is verified and account is enabled
        if (!user.isEmailVerified() || !user.isEnabled()) {
            throw new RuntimeException("Please verify your email and set your password before logging in. Check your inbox for the verification link.");
        }

        // Check if password is set
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new RuntimeException("Please set your password by clicking the verification link sent to your email.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());

        // Create UserResponse (exclude password)
        UserResponse userResponse = UserResponse.fromUser(user);

        // Return LoginResponse with token and user data
        return new LoginResponse(token, userResponse);
    }

    /**
     * Get user profile by email
     * 
     * Used in protected routes to fetch current user's profile.
     * Email is extracted from JWT token by the controller.
     * 
     * @param email User's email from JWT
     * @return UserResponse DTO
     * @throws RuntimeException if user not found
     */
    public UserResponse getUserProfile(String email) {
        
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Return UserResponse (exclude password)
        return UserResponse.fromUser(user);
    }

    /**
     * Update user profile
     * 
     * Process:
     * 1. Find user by email
     * 2. Update only provided fields (partial update)
     * 3. Save updated user
     * 4. Return updated UserResponse
     * 
     * Note: Email cannot be changed (business rule)
     * Password update requires separate endpoint (not implemented in Week 1-2)
     * 
     * @param email User's email from JWT
     * @param request UpdateUserRequest DTO
     * @return Updated UserResponse DTO
     * @throws RuntimeException if user not found
     */
    public UserResponse updateUserProfile(String email, UpdateUserRequest request) {
        
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update only provided fields (null checks)
        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }
        
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            user.setPhone(request.getPhone());
        }
        
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        // Save updated user to MongoDB
        User updatedUser = userRepository.save(user);

        // Return updated UserResponse (exclude password)
        return UserResponse.fromUser(updatedUser);
    }

    /**
     * Check if email exists in database
     * 
     * Utility method for validation
     * 
     * @param email Email to check
     * @return true if exists, false otherwise
     */
    public Boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Set password for user after email verification
     * 
     * Process:
     * 1. Find pending user by verification token
     * 2. Check if token is valid and not expired
     * 3. Validate password matches confirmation
     * 4. Create actual User entity with hashed password
     * 5. Save to users collection (verified users)
     * 6. Delete from pending_users collection
     * 7. Send success email
     * 8. Return success message
     * 
     * @param request SetPasswordRequest DTO
     * @return Success message
     * @throws RuntimeException if token is invalid or expired
     */
    public String setPassword(SetPasswordRequest request) {
        
        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Try to find user in users collection first (if admin approved)
        try {
            Optional<User> approvedUserOpt = userRepository.findByVerificationToken(request.getToken());
            
            if (approvedUserOpt.isPresent()) {
                // User was already approved by admin and moved to users collection
                User user = approvedUserOpt.get();
                
                // Check if token is expired
                if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
                    throw new RuntimeException("Verification link has expired. Please contact admin.");
                }
                
                // Hash password
                String hashedPassword = passwordEncoder.encode(request.getPassword());
                
                // Update user with password and activate account
                user.setPassword(hashedPassword);
                user.setEmailVerified(true);
                user.setEnabled(true);
                user.setVerificationToken(null);
                user.setVerificationTokenExpiry(null);
                
                // Save updated user
                userRepository.save(user);
                
                // Send account activation success email
                emailService.sendPasswordSetSuccessEmail(user.getEmail(), user.getName());
                
                return "Password set successfully! You can now login to your account.";
            }
        } catch (org.springframework.dao.IncorrectResultSizeDataAccessException e) {
            throw new RuntimeException("Multiple accounts found with the same verification token. Please contact support.");
        }

        // If not found in users collection, try pending users (old flow, should not happen with approval system)
        PendingUser pendingUser = pendingUserRepository.findByVerificationToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        // Check if token is expired
        if (pendingUser.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            // Delete expired pending user
            pendingUserRepository.delete(pendingUser);
            throw new RuntimeException("Verification link has expired. Please register again.");
        }

        // Hash password
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Create actual User entity (move from pending to verified)
        User user = new User();
        user.setName(pendingUser.getName());
        user.setEmail(pendingUser.getEmail());
        user.setPhone(pendingUser.getPhone());
        user.setAddress(pendingUser.getAddress());
        user.setPassword(hashedPassword);
        user.setEmailVerified(true);
        user.setEnabled(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);

        // Save to users collection (verified users)
        userRepository.save(user);

        // Delete from pending_users collection
        pendingUserRepository.delete(pendingUser);

        // Send account activation success email
        emailService.sendPasswordSetSuccessEmail(user.getEmail(), user.getName());

        return "Password set successfully! You can now login to your account.";
    }
}
