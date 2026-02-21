package com.ewaste.service;

import com.ewaste.model.PickupRequest;
import com.ewaste.model.PickupPerson;
import com.ewaste.repository.PickupRequestRepository;
import com.ewaste.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service for managing e-waste pickup requests
 */
@Service
public class PickupRequestService {
    
    @Autowired
    private PickupRequestRepository pickupRequestRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PickupPersonService pickupPersonService;
    
    /**
     * Create a new pickup request
     */
    @Transactional
    public PickupRequest createPickupRequest(PickupRequest request) {
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        request.setStatus("PENDING");
        return pickupRequestRepository.save(request);
    }
    
    /**
     * Get all pickup requests (Admin)
     */
    public List<PickupRequest> getAllPickupRequests() {
        return pickupRequestRepository.findAll();
    }
    
    /**
     * Get pickup requests by user ID
     */
    public List<PickupRequest> getUserPickupRequests(String userId) {
        return pickupRequestRepository.findByUserId(userId);
    }
    
    /**
     * Get pickup request by ID
     */
    public PickupRequest getPickupRequestById(String id) {
        return pickupRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pickup request not found with id: " + id));
    }
    
    /**
     * Get pickup requests by status
     */
    public List<PickupRequest> getPickupRequestsByStatus(String status) {
        return pickupRequestRepository.findByStatus(status);
    }
    
    /**
     * Approve a pickup request - sets status to IN_PROGRESS
     */
    @Transactional
    public PickupRequest approvePickupRequest(String id, String adminNotes, String assignedTo) {
        PickupRequest request = getPickupRequestById(id);
        
        request.setStatus("IN_PROGRESS");
        request.setAdminNotes(adminNotes);
        request.setAssignedTo(assignedTo);
        request.setUpdatedAt(LocalDateTime.now());
        
        PickupRequest updatedRequest = pickupRequestRepository.save(request);
        
        // Send approval email to user notifying that request is accepted and in progress
        emailService.sendPickupApprovalEmail(
            request.getUserEmail(),
            request.getUserName(),
            request.getId(),
            request.getDeviceType()
        );
        
        return updatedRequest;
    }
    
    /**
     * Reject a pickup request
     */
    @Transactional
    public PickupRequest rejectPickupRequest(String id, String reason) {
        PickupRequest request = getPickupRequestById(id);
        
        request.setStatus("REJECTED");
        request.setAdminNotes(reason);
        request.setUpdatedAt(LocalDateTime.now());
        
        PickupRequest updatedRequest = pickupRequestRepository.save(request);
        
        // Send rejection email to user
        emailService.sendPickupRejectionEmail(
            request.getUserEmail(),
            request.getUserName(),
            request.getDeviceType(),
            reason
        );
        
        return updatedRequest;
    }
    
    /**
     * Update pickup request status
     */
    @Transactional
    public PickupRequest updatePickupRequestStatus(String id, String status, String adminNotes) {
        PickupRequest request = getPickupRequestById(id);
        
        String oldStatus = request.getStatus();
        request.setStatus(status);
        if (adminNotes != null && !adminNotes.isEmpty()) {
            request.setAdminNotes(adminNotes);
        }
        request.setUpdatedAt(LocalDateTime.now());
        
        PickupRequest updatedRequest = pickupRequestRepository.save(request);
        
        // Send status update email if status changed significantly
        if (!oldStatus.equals(status) && (status.equals("IN_PROGRESS") || status.equals("RESOLVED") || status.equals("COMPLETED"))) {
            emailService.sendPickupStatusUpdateEmail(
                request.getUserEmail(),
                request.getUserName(),
                request.getId(),
                request.getDeviceType(),
                status
            );
        }
        
        return updatedRequest;
    }
    
    /**
     * Update pickup date
     */
    @Transactional
    public PickupRequest updatePickupDate(String id, String newDateStr, String reason) {
        PickupRequest request = getPickupRequestById(id);
        
        LocalDateTime oldDate = request.getPickupDate();
        
        // Parse ISO 8601 string (with or without timezone)
        LocalDateTime newDate;
        try {
            // Try parsing as Instant first (handles ISO strings with 'Z')
            newDate = java.time.Instant.parse(newDateStr)
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime();
        } catch (Exception e) {
            // Fallback to LocalDateTime parsing (for strings without timezone)
            newDate = LocalDateTime.parse(newDateStr);
        }
        
        request.setPickupDate(newDate);
        request.setUpdatedAt(LocalDateTime.now());
        
        PickupRequest updatedRequest = pickupRequestRepository.save(request);
        
        // Send date change email to user
        emailService.sendPickupDateChangeEmail(
            request.getUserEmail(),
            request.getUserName(),
            request.getId(),
            request.getDeviceType(),
            oldDate,
            newDate,
            reason
        );
        
        return updatedRequest;
    }
    
    /**
     * Delete a pickup request
     */
    @Transactional
    public void deletePickupRequest(String id) {
        if (!pickupRequestRepository.existsById(id)) {
            throw new RuntimeException("Pickup request not found with id: " + id);
        }
        pickupRequestRepository.deleteById(id);
    }
    
    /**
     * Assign pickup person to a request
     */
    @Transactional
    public PickupRequest assignPickupPerson(AssignPickupPersonRequest assignRequest) {
        PickupRequest request = getPickupRequestById(assignRequest.getRequestId());
        PickupPerson pickupPerson = pickupPersonService.getPickupPersonById(assignRequest.getPickupPersonId())
            .orElseThrow(() -> new RuntimeException("Pickup person not found"));
        
        // Update request with pickup person details
        request.setAssignedPickupPersonId(pickupPerson.getId());
        request.setAssignedPickupPersonName(pickupPerson.getName());
        request.setAssignedPickupPersonEmail(pickupPerson.getEmail());
        request.setAssignedAt(LocalDateTime.now());
        request.setStatus("ASSIGNED");
        request.setUpdatedAt(LocalDateTime.now());
        
        PickupRequest updatedRequest = pickupRequestRepository.save(request);
        
        // Send email to pickup person
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String pickupDateStr = request.getPickupDate() != null ? 
            request.getPickupDate().format(formatter) : "To be scheduled";
        
        emailService.sendPickupAssignmentEmail(
            pickupPerson.getEmail(),
            pickupPerson.getName(),
            request.getId(),
            request.getUserName(),
            request.getPickupAddress(),
            pickupDateStr,
            request.getDeviceType()
        );
        
        // Send email to user about assignment
        emailService.sendUserPickupAssignmentEmail(
            request.getUserEmail(),
            request.getUserName(),
            request.getId(),
            pickupPerson.getName(),
            pickupPerson.getPhone(),
            pickupDateStr,
            request.getDeviceType()
        );
        
        // Update pickup person pending count
        List<PickupRequest> pendingRequests = pickupRequestRepository.findByAssignedPickupPersonId(pickupPerson.getId());
        long pendingCount = pendingRequests.stream()
            .filter(r -> !r.getStatus().equals("COMPLETED") && !r.getStatus().equals("CANCELLED"))
            .count();
        pickupPersonService.updatePendingPickups(pickupPerson.getId(), (int) pendingCount);
        
        return updatedRequest;
    }
    
    /**
     * Get requests assigned to a pickup person
     */
    public List<PickupRequest> getPickupPersonRequests(String pickupPersonId) {
        return pickupRequestRepository.findByAssignedPickupPersonId(pickupPersonId);
    }
    
    /**
     * Mark pickup as completed (by pickup person)
     */
    @Transactional
    public PickupRequest completePickup(CompletePickupRequest completeRequest) {
        PickupRequest request = getPickupRequestById(completeRequest.getRequestId());
        
        request.setActualPickupTime(completeRequest.getActualPickupTime());
        request.setCollectedEwastePhotos(completeRequest.getCollectedEwastePhotos());
        request.setPickupCompletionStatus("IN_REVIEW");
        request.setStatus("IN_REVIEW");
        request.setUpdatedAt(LocalDateTime.now());
        
        // Reset review fields so it appears in admin review queue again
        request.setReviewedByAdmin(false);
        request.setReviewNotes(null);
        request.setReviewedAt(null);
        
        return pickupRequestRepository.save(request);
    }
    
    /**
     * Mark pickup as not completed (by pickup person)
     */
    @Transactional
    public PickupRequest markPickupNotCompleted(NotCompletedPickupRequest notCompletedRequest) {
        PickupRequest request = getPickupRequestById(notCompletedRequest.getRequestId());
        
        request.setNotCompletedReason(notCompletedRequest.getReason());
        request.setNextAvailableDate(notCompletedRequest.getNextAvailableDate());
        request.setPickupDate(notCompletedRequest.getNextAvailableDate());
        request.setPickupCompletionStatus("NOT_COMPLETED");
        request.setStatus("POSTPONED");
        request.setUpdatedAt(LocalDateTime.now());
        
        PickupRequest updatedRequest = pickupRequestRepository.save(request);
        
        // Send postponement email to user
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String newDateStr = notCompletedRequest.getNextAvailableDate().format(formatter);
        
        emailService.sendPickupPostponedEmail(
            request.getUserEmail(),
            request.getUserName(),
            request.getId(),
            notCompletedRequest.getReason(),
            newDateStr
        );
        
        return updatedRequest;
    }
    
    /**
     * Get requests pending admin review
     */
    public List<PickupRequest> getRequestsForReview() {
        return pickupRequestRepository.findByPickupCompletionStatusAndReviewedByAdmin("IN_REVIEW", false);
    }
    
    /**
     * Admin reviews completed pickup
     */
    @Transactional
    public PickupRequest reviewPickup(ReviewPickupRequest reviewRequest) {
        PickupRequest request = getPickupRequestById(reviewRequest.getRequestId());
        
        if (reviewRequest.isApproved()) {
            request.setStatus("RESOLVED");
            request.setPickupCompletionStatus("COMPLETED");
            
            // Increment pickup person's completed count
            if (request.getAssignedPickupPersonId() != null) {
                pickupPersonService.incrementPickupsCompleted(request.getAssignedPickupPersonId());
            }
            
            // Send email to user about request resolution
            emailService.sendRequestResolvedEmail(
                request.getUserEmail(),
                request.getUserName(),
                request.getId(),
                request.getDeviceType(),
                request.getAssignedPickupPersonName()
            );
        } else {
            // Reset request for retry
            request.setStatus("IN_PROGRESS");
            request.setPickupCompletionStatus("NOT_COMPLETED");
            
            // Clear previous completion data to allow new attempt
            request.setActualPickupTime(null);
            request.setCollectedEwastePhotos(null);
            
            // Send email to pickup person about rejection
            if (request.getAssignedPickupPersonEmail() != null) {
                emailService.sendPickupReviewRejectedToPickupPerson(
                    request.getAssignedPickupPersonEmail(),
                    request.getAssignedPickupPersonName(),
                    request.getId(),
                    request.getDeviceType(),
                    reviewRequest.getReviewNotes(),
                    request.getPickupAddress()
                );
            }
            
            // Send email to user about rescheduling
            emailService.sendPickupReviewRejectedToUser(
                request.getUserEmail(),
                request.getUserName(),
                request.getId(),
                request.getDeviceType(),
                request.getAssignedPickupPersonName()
            );
        }
        
        request.setReviewedByAdmin(true);
        request.setReviewNotes(reviewRequest.getReviewNotes());
        request.setReviewedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        
        return pickupRequestRepository.save(request);
    }
}
