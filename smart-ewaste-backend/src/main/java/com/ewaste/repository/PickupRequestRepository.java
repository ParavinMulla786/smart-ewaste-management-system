package com.ewaste.repository;

import com.ewaste.model.PickupRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for PickupRequest entity
 */
@Repository
public interface PickupRequestRepository extends MongoRepository<PickupRequest, String> {
    
    /**
     * Find all pickup requests by user ID
     */
    List<PickupRequest> findByUserId(String userId);
    
    /**
     * Find pickup requests by status
     */
    List<PickupRequest> findByStatus(String status);
    
    /**
     * Find pickup requests by user email
     */
    List<PickupRequest> findByUserEmail(String userEmail);
    
    /**
     * Find pickup requests by status and created before a certain date
     * Used for auto-rejecting old pending requests
     */
    List<PickupRequest> findByStatusAndCreatedAtBefore(String status, LocalDateTime dateTime);
    
    /**
     * Find pickup requests assigned to a specific pickup person
     */
    List<PickupRequest> findByAssignedPickupPersonId(String pickupPersonId);
    
    /**
     * Find pickup requests by completion status
     */
    List<PickupRequest> findByPickupCompletionStatus(String completionStatus);
    
    /**
     * Find pickup requests that are in review (reviewedByAdmin = false and pickupCompletionStatus = IN_REVIEW)
     */
    List<PickupRequest> findByPickupCompletionStatusAndReviewedByAdmin(String completionStatus, boolean reviewedByAdmin);
}
