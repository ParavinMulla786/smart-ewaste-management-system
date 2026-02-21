package com.ewaste.controller;

import com.ewaste.model.PickupPerson;
import com.ewaste.model.PickupRequest;
import com.ewaste.service.PickupPersonService;
import com.ewaste.service.PickupRequestService;
import com.ewaste.service.EmailService;
import com.ewaste.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for pickup person management
 */
@RestController
@RequestMapping("/api/pickup-persons")
@CrossOrigin(origins = "*")
public class PickupPersonController {

    @Autowired
    private PickupPersonService pickupPersonService;
    
    @Autowired
    private PickupRequestService pickupRequestService;
    
    @Autowired
    private EmailService emailService;

    /**
     * Register a new pickup person
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerPickupPerson(@RequestBody PickupPerson pickupPerson) {
        try {
            // Register pickup person - returns [PickupPerson, plainPassword]
            Object[] result = pickupPersonService.registerPickupPerson(pickupPerson);
            PickupPerson registered = (PickupPerson) result[0];
            String temporaryPassword = (String) result[1];
            
            // Send registration email with temporary password
            try {
                System.out.println("Sending registration email to: " + registered.getEmail());
                System.out.println("Temporary password: " + temporaryPassword);
                emailService.sendPickupPersonRegistrationEmail(
                    registered.getEmail(),
                    registered.getName(),
                    temporaryPassword
                );
            } catch (Exception emailError) {
                // Log email error but don't fail the registration
                System.err.println("Failed to send registration email: " + emailError.getMessage());
                emailError.printStackTrace();
            }
            
            // Remove password from response
            registered.setPassword(null);
            
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get all pickup persons
     */
    @GetMapping
    public ResponseEntity<List<PickupPerson>> getAllPickupPersons() {
        List<PickupPerson> persons = pickupPersonService.getAllPickupPersons();
        
        // Remove passwords from response
        persons.forEach(p -> p.setPassword(null));
        
        return ResponseEntity.ok(persons);
    }

    /**
     * Get all active pickup persons
     */
    @GetMapping("/active")
    public ResponseEntity<List<PickupPerson>> getActivePickupPersons() {
        List<PickupPerson> persons = pickupPersonService.getActivePickupPersons();
        
        // Remove passwords from response
        persons.forEach(p -> p.setPassword(null));
        
        return ResponseEntity.ok(persons);
    }

    /**
     * Get pickup person by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPickupPersonById(@PathVariable String id) {
        return pickupPersonService.getPickupPersonById(id)
            .map(person -> {
                person.setPassword(null);
                return ResponseEntity.ok(person);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get pickup person by email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getPickupPersonByEmail(@PathVariable String email) {
        return pickupPersonService.getPickupPersonByEmail(email)
            .map(person -> {
                person.setPassword(null);
                return ResponseEntity.ok(person);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update pickup person
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePickupPerson(@PathVariable String id, @RequestBody PickupPerson pickupPerson) {
        try {
            PickupPerson updated = pickupPersonService.updatePickupPerson(id, pickupPerson);
            updated.setPassword(null);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Toggle pickup person active status
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleActiveStatus(@PathVariable String id) {
        try {
            PickupPerson updated = pickupPersonService.toggleActiveStatus(id);
            updated.setPassword(null);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Delete pickup person
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePickupPerson(@PathVariable String id) {
        try {
            pickupPersonService.deletePickupPerson(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Pickup person deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Assign pickup person to a request
     */
    @PostMapping("/assign")
    public ResponseEntity<?> assignPickupPerson(@RequestBody AssignPickupPersonRequest request) {
        try {
            PickupRequest updatedRequest = pickupRequestService.assignPickupPerson(request);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get requests assigned to a pickup person
     */
    @GetMapping("/{id}/requests")
    public ResponseEntity<List<PickupRequest>> getPickupPersonRequests(@PathVariable String id) {
        List<PickupRequest> requests = pickupRequestService.getPickupPersonRequests(id);
        return ResponseEntity.ok(requests);
    }

    /**
     * Mark pickup as completed
     */
    @PostMapping("/complete-pickup")
    public ResponseEntity<?> completePickup(@RequestBody CompletePickupRequest request) {
        try {
            PickupRequest updated = pickupRequestService.completePickup(request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Mark pickup as not completed
     */
    @PostMapping("/not-completed")
    public ResponseEntity<?> markNotCompleted(@RequestBody NotCompletedPickupRequest request) {
        try {
            PickupRequest updated = pickupRequestService.markPickupNotCompleted(request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get requests pending admin review
     */
    @GetMapping("/reviews/pending")
    public ResponseEntity<List<PickupRequest>> getRequestsForReview() {
        List<PickupRequest> requests = pickupRequestService.getRequestsForReview();
        return ResponseEntity.ok(requests);
    }

    /**
     * Admin reviews completed pickup
     */
    @PostMapping("/review")
    public ResponseEntity<?> reviewPickup(@RequestBody ReviewPickupRequest request) {
        try {
            PickupRequest updated = pickupRequestService.reviewPickup(request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Reset password for pickup person (clears temporary password flag)
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            PickupPerson updated = pickupPersonService.resetPassword(
                request.getEmail(), 
                request.getOldPassword(), 
                request.getNewPassword()
            );
            
            // Remove password from response
            updated.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password reset successfully");
            response.put("user", updated);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
