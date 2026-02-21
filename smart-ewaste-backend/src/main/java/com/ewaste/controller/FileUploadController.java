package com.ewaste.controller;

import com.ewaste.model.User;
import com.ewaste.repository.UserRepository;
import com.ewaste.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * File Upload Controller
 * Handles file upload operations to AWS S3
 * 
 * Base URL: /api/files
 * All endpoints require authentication (JWT token)
 */
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000")
public class FileUploadController {

    @Autowired
    private S3Service s3Service;

    @Autowired
    private UserRepository userRepository;

    /**
     * Upload profile image
     * 
     * POST /api/files/upload/profile-image
     * Headers: Authorization: Bearer <JWT_TOKEN>
     * Content-Type: multipart/form-data
     * Body: file (image file)
     * 
     * Response: 200 OK
     * {
     *   "success": true,
     *   "message": "Profile image uploaded successfully",
     *   "imageUrl": "https://bucket.s3.region.amazonaws.com/profile-images/uuid.jpg"
     * }
     * 
     * @param file Image file to upload
     * @return ResponseEntity with upload result
     */
    @PostMapping("/upload/profile-image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        try {
            // Upload to S3
            String imageUrl = s3Service.uploadFile(file, "profile-images");

            // Update user profile with new image URL
            String email = getCurrentUserEmail();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Delete old profile image if exists
            if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isEmpty()) {
                try {
                    s3Service.deleteFile(user.getProfileImageUrl());
                } catch (Exception e) {
                    // Log but don't fail if old image deletion fails
                    System.err.println("Failed to delete old profile image: " + e.getMessage());
                }
            }

            user.setProfileImageUrl(imageUrl);
            userRepository.save(user);

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile image uploaded successfully");
            response.put("imageUrl", imageUrl);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to upload image: " + e.getMessage()));
        }
    }

    /**
     * Upload e-waste images for pickup request
     * 
     * POST /api/files/upload/ewaste-images
     * Headers: Authorization: Bearer <JWT_TOKEN>
     * Content-Type: multipart/form-data
     * Body: files[] (multiple image files)
     * 
     * Response: 200 OK
     * {
     *   "success": true,
     *   "message": "Images uploaded successfully",
     *   "imageUrls": [
     *     "https://bucket.s3.region.amazonaws.com/ewaste-images/uuid1.jpg",
     *     "https://bucket.s3.region.amazonaws.com/ewaste-images/uuid2.jpg"
     *   ]
     * }
     * 
     * @param files Array of image files to upload
     * @return ResponseEntity with upload result
     */
    @PostMapping("/upload/ewaste-images")
    public ResponseEntity<?> uploadEwasteImages(@RequestParam("files") MultipartFile[] files) {
        try {
            // Validate files array
            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No files provided"));
            }

            // Upload all files to S3
            List<String> imageUrls = s3Service.uploadMultipleFiles(files, "ewaste-images");

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Images uploaded successfully");
            response.put("imageUrls", imageUrls);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to upload images: " + e.getMessage()));
        }
    }

    /**
     * Delete profile image
     * 
     * DELETE /api/files/delete/profile-image
     * Headers: Authorization: Bearer <JWT_TOKEN>
     * 
     * Response: 200 OK
     * {
     *   "success": true,
     *   "message": "Profile image deleted successfully"
     * }
     * 
     * @return ResponseEntity with deletion result
     */
    @DeleteMapping("/delete/profile-image")
    public ResponseEntity<?> deleteProfileImage() {
        try {
            String email = getCurrentUserEmail();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getProfileImageUrl() == null || user.getProfileImageUrl().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No profile image to delete"));
            }

            // Delete from S3
            s3Service.deleteFile(user.getProfileImageUrl());

            // Update user profile
            user.setProfileImageUrl(null);
            userRepository.save(user);

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile image deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to delete image: " + e.getMessage()));
        }
    }

    /**
     * Helper method to extract current user's email from SecurityContext
     * 
     * @return Current user's email
     */
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    /**
     * Helper method to create error response
     * 
     * @param message Error message
     * @return Error response map
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
