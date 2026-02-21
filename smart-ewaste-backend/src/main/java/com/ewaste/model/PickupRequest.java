package com.ewaste.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * PickupRequest Entity
 * Stores e-waste pickup requests submitted by users
 */
@Data
@Document(collection = "pickup_requests")
public class PickupRequest {
    
    @Id
    private String id;
    
    // User information
    private String userId;
    private String userName;
    private String userEmail;
    
    // E-waste details
    private String deviceType; // Laptop, Mobile, TV, etc.
    private String brand;
    private String model;
    private String condition; // Working, Damaged, Dead
    private Integer quantity;
    
    // Pickup details
    private String pickupAddress;
    private String remarks;
    private List<String> images; // Image URLs/paths
    private LocalDateTime pickupDate; // Preferred/Scheduled pickup date
    
    // Request status
    private String status; // PENDING, REJECTED, IN_PROGRESS, COMPLETED, CANCELLED, POSTPONED, ASSIGNED, IN_REVIEW, RESOLVED
    private String adminNotes;
    private String assignedTo; // Admin who is handling the request
    
    // Pickup Person Assignment
    private String assignedPickupPersonId; // ID of pickup person assigned
    private String assignedPickupPersonName; // Name of pickup person
    private String assignedPickupPersonEmail; // Email of pickup person
    private LocalDateTime assignedAt; // When pickup person was assigned
    
    // Pickup Completion Details (filled by pickup person)
    private LocalDateTime actualPickupTime; // Actual time of pickup
    private List<String> collectedEwastePhotos; // Photos of collected e-waste
    private String pickupCompletionStatus; // COMPLETED, NOT_COMPLETED, IN_REVIEW
    
    // Not Completed Details
    private String notCompletedReason; // Reason for not completing pickup
    private LocalDateTime nextAvailableDate; // Next available date for pickup
    
    // Admin Review
    private boolean reviewedByAdmin = false;
    private String reviewNotes;
    private LocalDateTime reviewedAt;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public PickupRequest() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "PENDING";
        this.reviewedByAdmin = false;
    }
}
