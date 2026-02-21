package com.ewaste.scheduler;

import com.ewaste.model.PickupRequest;
import com.ewaste.repository.PickupRequestRepository;
import com.ewaste.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Pickup Request Scheduler
 * 
 * Handles automatic rejection of pending requests after 5 days
 */
@Component
public class PickupRequestScheduler {

    @Autowired
    private PickupRequestRepository pickupRequestRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Automatically reject pending requests older than 5 days
     * Runs every day at 2 AM
     * Can also be called manually via API
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void autoRejectOldPendingRequests() {
        System.out.println("Running scheduled task: Auto-reject old pending requests");
        
        try {
            // Calculate the date 5 days ago
            LocalDateTime fiveDaysAgo = LocalDateTime.now().minusDays(5);
            
            // Find all PENDING requests older than 5 days
            List<PickupRequest> oldPendingRequests = pickupRequestRepository
                .findByStatusAndCreatedAtBefore("PENDING", fiveDaysAgo);
            
            if (oldPendingRequests.isEmpty()) {
                System.out.println("No old pending requests found for auto-rejection");
                return;
            }
            
            System.out.println("Found " + oldPendingRequests.size() + " old pending requests to reject");
            
            // Process each old pending request
            for (PickupRequest request : oldPendingRequests) {
                try {
                    // Update status to REJECTED
                    request.setStatus("REJECTED");
                    request.setAdminNotes("Automatically rejected - No admin action taken within 5 days");
                    request.setUpdatedAt(LocalDateTime.now());
                    
                    pickupRequestRepository.save(request);
                    
                    // Send rejection email to user
                    emailService.sendPickupRejectionEmail(
                        request.getUserEmail(),
                        request.getUserName(),
                        request.getDeviceType(),
                        "Your request was not reviewed by admin within 5 days. Please submit a new request if needed."
                    );
                    
                    System.out.println("Auto-rejected request ID: " + request.getId() + 
                                     " for user: " + request.getUserEmail());
                    
                } catch (Exception e) {
                    System.err.println("Failed to auto-reject request ID: " + request.getId() + 
                                     " - Error: " + e.getMessage());
                }
            }
            
            System.out.println("Auto-rejection task completed successfully");
            
        } catch (Exception e) {
            System.err.println("Error in auto-rejection scheduled task: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Alternative method: Run every hour to check for old pending requests
     * Uncomment @Scheduled annotation below to use this instead of daily check
     */
    // @Scheduled(fixedRate = 3600000) // Run every hour (3600000 ms = 1 hour)
    public void autoRejectOldPendingRequestsHourly() {
        autoRejectOldPendingRequests();
    }
}
