package com.ewaste.controller;

import com.ewaste.dto.PickupRequestDTO;
import com.ewaste.dto.UpdateUserRequest;
import com.ewaste.dto.UserResponse;
import com.ewaste.model.PickupRequest;
import com.ewaste.model.User;
import com.ewaste.repository.UserRepository;
import com.ewaste.service.PickupRequestService;
import com.ewaste.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * User Profile Controller
 * 
 * Handles user profile management endpoints:
 * - Get user profile
 * - Update user profile
 * 
 * Base URL: /api/user
 * All endpoints require authentication (JWT token)
 */
@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000") // Allow React frontend
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private PickupRequestService pickupRequestService;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Get current user's profile
     * 
     * GET /api/user/profile
     * Headers: Authorization: Bearer <JWT_TOKEN>
     * 
     * Response: 200 OK
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "phone": "+1234567890",
     *   "address": "123 Main St"
     * }
     * 
     * Error: 401 Unauthorized if token is missing/invalid
     * Error: 404 Not Found if user doesn't exist
     * 
     * @return ResponseEntity with UserResponse or error
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            // Extract email from JWT token (set by JwtAuthenticationFilter)
            String email = getCurrentUserEmail();
            
            // Call service to get user profile
            UserResponse response = userService.getUserProfile(email);
            
            // Return 200 OK with user data
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            // Return 404 Not Found with error message
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update current user's profile
     * 
     * PUT /api/user/update
     * Headers: Authorization: Bearer <JWT_TOKEN>
     * 
     * Request Body: UpdateUserRequest (JSON)
     * {
     *   "name": "John Updated",      (optional)
     *   "phone": "+9876543210",      (optional)
     *   "address": "456 New St"      (optional)
     * }
     * 
     * Note: Email cannot be changed
     * Only provided fields will be updated
     * 
     * Response: 200 OK
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "name": "John Updated",
     *   "email": "john@example.com",
     *   "phone": "+9876543210",
     *   "address": "456 New St"
     * }
     * 
     * Error: 401 Unauthorized if token is missing/invalid
     * Error: 400 Bad Request if validation fails
     * 
     * @param request UpdateUserRequest DTO with validation
     * @return ResponseEntity with updated UserResponse or error
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateUserRequest request) {
        try {
            // Extract email from JWT token
            String email = getCurrentUserEmail();
            
            // Call service to update user profile
            UserResponse response = userService.updateUserProfile(email, request);
            
            // Return 200 OK with updated user data
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            // Return 400 Bad Request with error message
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Helper method to extract current user's email from SecurityContext
     * 
     * The email is set by JwtAuthenticationFilter after validating the JWT token.
     * Spring Security stores the authenticated user in SecurityContext.
     * 
     * @return Current user's email
     */
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName(); // Returns email (username in our case)
    }

    // ==================== PICKUP REQUEST MANAGEMENT ====================
    
    /**
     * Create a new pickup request
     */
    @PostMapping("/pickup-requests")
    public ResponseEntity<?> createPickupRequest(@Valid @RequestBody PickupRequestDTO requestDTO) {
        try {
            String email = getCurrentUserEmail();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            PickupRequest pickupRequest = new PickupRequest();
            pickupRequest.setUserId(user.getId());
            pickupRequest.setUserName(user.getName());
            pickupRequest.setUserEmail(user.getEmail());
            pickupRequest.setDeviceType(requestDTO.getDeviceType());
            pickupRequest.setBrand(requestDTO.getBrand());
            pickupRequest.setModel(requestDTO.getModel());
            pickupRequest.setCondition(requestDTO.getCondition());
            pickupRequest.setQuantity(requestDTO.getQuantity());
            pickupRequest.setPickupAddress(requestDTO.getPickupAddress());
            pickupRequest.setRemarks(requestDTO.getRemarks());
            pickupRequest.setImages(requestDTO.getImages());
            pickupRequest.setPickupDate(requestDTO.getPickupDate());
            
            PickupRequest createdRequest = pickupRequestService.createPickupRequest(pickupRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Get all pickup requests for current user
     */
    @GetMapping("/pickup-requests")
    public ResponseEntity<?> getUserPickupRequests() {
        try {
            String email = getCurrentUserEmail();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<PickupRequest> requests = pickupRequestService.getUserPickupRequests(user.getId());
            return ResponseEntity.ok(requests);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Get a specific pickup request by ID
     */
    @GetMapping("/pickup-requests/{id}")
    public ResponseEntity<?> getPickupRequestById(@PathVariable String id) {
        try {
            String email = getCurrentUserEmail();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            PickupRequest request = pickupRequestService.getPickupRequestById(id);
            
            // Ensure user can only view their own requests
            if (!request.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Access denied"));
            }
            
            return ResponseEntity.ok(request);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
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
