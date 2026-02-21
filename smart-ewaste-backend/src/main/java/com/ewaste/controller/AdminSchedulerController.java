package com.ewaste.controller;

import com.ewaste.scheduler.PickupRequestScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Admin Scheduler Controller
 * Allows admins to manually trigger scheduled tasks
 */
@RestController
@RequestMapping("/api/admin/scheduler")
@CrossOrigin(origins = "*")
public class AdminSchedulerController {

    @Autowired
    private PickupRequestScheduler pickupRequestScheduler;

    /**
     * Manually trigger auto-rejection of old pending requests
     * Useful for testing or immediate execution
     * 
     * @return Response with execution status
     */
    @PostMapping("/auto-reject-old-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> triggerAutoRejectOldRequests() {
        try {
            System.out.println("Manual trigger: Auto-reject old pending requests");
            
            // Execute the scheduled task immediately
            pickupRequestScheduler.autoRejectOldPendingRequests();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Auto-rejection task executed successfully");
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to execute auto-rejection task: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
