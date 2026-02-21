package com.ewaste.controller;

import com.ewaste.dto.LoginRequest;
import com.ewaste.dto.LoginResponse;
import com.ewaste.dto.RegisterRequest;
import com.ewaste.dto.SetPasswordRequest;
import com.ewaste.dto.UserResponse;
import com.ewaste.service.UserService;
import com.ewaste.service.AdminService;
import com.ewaste.service.PickupPersonService;
import com.ewaste.model.Admin;
import com.ewaste.model.PickupPerson;
import com.ewaste.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Authentication Controller
 * 
 * Handles authentication-related endpoints:
 * - User registration
 * - User login (includes admin login)
 * 
 * Base URL: /api/auth
 * All endpoints are public (no authentication required)
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // Allow React frontend
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private PickupPersonService pickupPersonService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Register a new user
     * 
     * POST /api/auth/register
     * 
     * Request Body: RegisterRequest (JSON)
     * {
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "phone": "+1234567890",
     *   "password": "SecurePass123",
     *   "address": "123 Main St" (optional)
     * }
     * 
     * Response: 201 Created
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "phone": "+1234567890",
     *   "address": "123 Main St"
     * }
     * 
     * Error: 400 Bad Request if validation fails or email exists
     * 
     * @param request RegisterRequest DTO with validation
     * @return ResponseEntity with UserResponse or error
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Call service to register user
            UserResponse response = userService.registerUser(request);
            
            // Return 201 Created with user data
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            // Return 400 Bad Request with error message
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Login user or admin and generate JWT token
     * 
     * POST /api/auth/login
     * 
     * Request Body: LoginRequest (JSON)
     * {
     *   "email": "john@example.com",
     *   "password": "SecurePass123"
     * }
     * 
     * Response: 200 OK
     * {
     *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "role": "USER" or "ADMIN",
     *   "user": {
     *     "id": "507f1f77bcf86cd799439011",
     *     "name": "John Doe",
     *     "email": "john@example.com",
     *     "phone": "+1234567890",
     *     "address": "123 Main St"
     *   }
     * }
     * 
     * Error: 401 Unauthorized if credentials are invalid
     * 
     * @param request LoginRequest DTO with validation
     * @return ResponseEntity with LoginResponse (token + user + role) or error
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            // First, check if this is an admin login
            if (adminService.existsByEmail(request.getEmail())) {
                Admin admin = adminService.getAdminByEmail(request.getEmail());
                
                // Verify admin password
                if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
                    throw new RuntimeException("Invalid email or password");
                }
                
                // Check if admin is enabled
                if (!admin.isEnabled()) {
                    throw new RuntimeException("Admin account is disabled");
                }
                
                // Generate JWT token
                String token = jwtUtil.generateToken(admin.getEmail());
                
                // Create user response for admin
                UserResponse userResponse = new UserResponse();
                userResponse.setId(admin.getId());
                userResponse.setName(admin.getName());
                userResponse.setEmail(admin.getEmail());
                userResponse.setPhone(null);
                userResponse.setAddress(null);
                userResponse.setAvatar(null);
                userResponse.setCreatedAt(admin.getCreatedAt());
                
                // Return login response with ADMIN role
                return ResponseEntity.ok(new AdminLoginResponse(token, userResponse, "ADMIN"));
            }
            
            // Second, check if this is a pickup person login
            Optional<PickupPerson> pickupPersonOpt = pickupPersonService.getPickupPersonByEmail(request.getEmail());
            if (pickupPersonOpt.isPresent()) {
                PickupPerson pickupPerson = pickupPersonOpt.get();
                
                // Verify pickup person password
                if (!passwordEncoder.matches(request.getPassword(), pickupPerson.getPassword())) {
                    throw new RuntimeException("Invalid email or password");
                }
                
                // Check if pickup person is active
                if (!pickupPerson.isActive()) {
                    throw new RuntimeException("Pickup person account is disabled");
                }
                
                // Generate JWT token
                String token = jwtUtil.generateToken(pickupPerson.getEmail());
                
                // Create user response for pickup person
                UserResponse userResponse = new UserResponse();
                userResponse.setId(pickupPerson.getId());
                userResponse.setName(pickupPerson.getName());
                userResponse.setEmail(pickupPerson.getEmail());
                userResponse.setPhone(pickupPerson.getPhone());
                userResponse.setAddress(pickupPerson.getArea());
                userResponse.setAvatar(null);
                userResponse.setCreatedAt(pickupPerson.getCreatedAt());
                
                // Return login response with PICKUP_PERSON role and temporary password flag
                return ResponseEntity.ok(new AdminLoginResponse(token, userResponse, "PICKUP_PERSON", pickupPerson.isTemporaryPassword()));
            }
            
            // Otherwise, try regular user login
            LoginResponse response = userService.loginUser(request);
            
            // Add USER role to response
            return ResponseEntity.ok(new AdminLoginResponse(response.getToken(), response.getUser(), "USER"));
            
        } catch (RuntimeException e) {
            // Return 401 Unauthorized with error message
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Admin Login Response
     * Extends LoginResponse with role field
     */
    private static class AdminLoginResponse {
        private String token;
        private UserResponse user;
        private String role;
        private Boolean isTemporaryPassword;
        
        public AdminLoginResponse(String token, UserResponse user, String role) {
            this.token = token;
            this.user = user;
            this.role = role;
            this.isTemporaryPassword = null; // Only set for pickup persons
        }
        
        public AdminLoginResponse(String token, UserResponse user, String role, boolean isTemporaryPassword) {
            this.token = token;
            this.user = user;
            this.role = role;
            this.isTemporaryPassword = isTemporaryPassword;
        }
        
        public String getToken() {
            return token;
        }
        
        public UserResponse getUser() {
            return user;
        }
        
        public String getRole() {
            return role;
        }
        
        public Boolean getIsTemporaryPassword() {
            return isTemporaryPassword;
        }
    }

    /**
     * Set password after email verification
     * 
     * POST /api/auth/set-password
     * 
     * Request Body: SetPasswordRequest (JSON)
     * {
     *   "token": "verification-token-from-email",
     *   "password": "NewSecurePass123",
     *   "confirmPassword": "NewSecurePass123"
     * }
     * 
     * Response: 200 OK
     * {
     *   "message": "Password set successfully! You can now login to your account."
     * }
     * 
     * Error: 400 Bad Request if token invalid/expired or passwords don't match
     * 
     * @param request SetPasswordRequest DTO with validation
     * @return ResponseEntity with success message or error
     */
    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@Valid @RequestBody SetPasswordRequest request) {
        try {
            // Call service to set password and activate account
            String message = userService.setPassword(request);
            
            // Return 200 OK with success message
            return ResponseEntity.ok(new SuccessResponse(message));
            
        } catch (RuntimeException e) {
            // Return 400 Bad Request with error message
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Success Response DTO
     * 
     * Used to return consistent success messages
     */
    private static class SuccessResponse {
        private String message;
        private long timestamp;

        public SuccessResponse(String message) {
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }

        public String getMessage() {
            return message;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }

    /**
     * Error Response DTO
     * 
     * Used to return consistent error messages
     */
    private static class ErrorResponse {
        private String message;
        private long timestamp;

        public ErrorResponse(String message) {
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }

        public String getMessage() {
            return message;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }
}
