package com.ewaste.controller;

import com.ewaste.dto.*;
import com.ewaste.model.PickupRequest;
import com.ewaste.model.User;
import com.ewaste.model.PendingUser;
import com.ewaste.service.AdminService;
import com.ewaste.service.PickupRequestService;
import com.ewaste.service.ReportService;
import com.ewaste.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Controller
 * Handles admin operations: user management, report management, admin management
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final AdminService adminService;
    private final UserManagementService userManagementService;
    private final ReportService reportService;
    private final PickupRequestService pickupRequestService;

    // ==================== USER MANAGEMENT ====================

    /**
     * Get all users
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userManagementService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by ID
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        User user = userManagementService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Block a user
     */
    @PutMapping("/users/{id}/block")
    public ResponseEntity<Map<String, String>> blockUser(@PathVariable String id) {
        userManagementService.blockUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User blocked successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Unblock a user
     */
    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<Map<String, String>> unblockUser(@PathVariable String id) {
        userManagementService.unblockUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User unblocked successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a user
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        userManagementService.deleteUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Get blocked users
     */
    @GetMapping("/users/blocked")
    public ResponseEntity<List<User>> getBlockedUsers() {
        List<User> users = userManagementService.getBlockedUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get active users
     */
    @GetMapping("/users/active")
    public ResponseEntity<List<User>> getActiveUsers() {
        List<User> users = userManagementService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get pending users (awaiting admin approval)
     */
    @GetMapping("/users/pending")
    public ResponseEntity<List<PendingUser>> getPendingUsers() {
        List<PendingUser> pendingUsers = userManagementService.getPendingUsers();
        return ResponseEntity.ok(pendingUsers);
    }

    /**
     * Approve a pending user and send verification email
     */
    @PutMapping("/users/pending/{id}/approve")
    public ResponseEntity<Map<String, String>> approveUser(@PathVariable String id) {
        userManagementService.approveUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User approved successfully. Verification email has been sent.");
        return ResponseEntity.ok(response);
    }

    /**
     * Reject a pending user registration
     */
    @DeleteMapping("/users/pending/{id}")
    public ResponseEntity<Map<String, String>> rejectUser(@PathVariable String id) {
        userManagementService.rejectUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User registration rejected successfully.");
        return ResponseEntity.ok(response);
    }

    // ==================== REPORT MANAGEMENT ====================

    /**
     * Get all reports
     */
    @GetMapping("/reports")
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        List<ReportResponse> reports = reportService.getAllReports();
        return ResponseEntity.ok(reports);
    }

    /**
     * Get report by ID
     */
    @GetMapping("/reports/{id}")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable String id) {
        ReportResponse report = reportService.getReportById(id);
        return ResponseEntity.ok(report);
    }

    /**
     * Get reports by status
     */
    @GetMapping("/reports/status/{status}")
    public ResponseEntity<List<ReportResponse>> getReportsByStatus(@PathVariable String status) {
        List<ReportResponse> reports = reportService.getReportsByStatus(status);
        return ResponseEntity.ok(reports);
    }

    /**
     * Update report (assign, add notes, change status)
     */
    @PutMapping("/reports/{id}")
    public ResponseEntity<ReportResponse> updateReport(
            @PathVariable String id,
            @Valid @RequestBody UpdateReportRequest request,
            Authentication authentication) {
        String adminId = authentication.getName(); // Get current admin ID from JWT
        ReportResponse updated = reportService.updateReport(id, request, adminId);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete report
     */
    @DeleteMapping("/reports/{id}")
    public ResponseEntity<Map<String, String>> deleteReport(@PathVariable String id) {
        reportService.deleteReport(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Report deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Get reports assigned to current admin
     */
    @GetMapping("/reports/assigned")
    public ResponseEntity<List<ReportResponse>> getAssignedReports(Authentication authentication) {
        String adminId = authentication.getName();
        List<ReportResponse> reports = reportService.getAssignedReports(adminId);
        return ResponseEntity.ok(reports);
    }

    // ==================== ADMIN MANAGEMENT ====================

    /**
     * Create a new admin
     */
    @PostMapping("/admins")
    public ResponseEntity<AdminResponse> createAdmin(
            @Valid @RequestBody CreateAdminRequest request,
            Authentication authentication) {
        String createdBy = authentication.getName(); // Current admin ID
        AdminResponse admin = adminService.createAdmin(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(admin);
    }

    /**
     * Get all admins
     */
    @GetMapping("/admins")
    public ResponseEntity<List<AdminResponse>> getAllAdmins() {
        List<AdminResponse> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }

    /**
     * Get admin by ID
     */
    @GetMapping("/admins/{id}")
    public ResponseEntity<AdminResponse> getAdminById(@PathVariable String id) {
        AdminResponse admin = adminService.getAdminById(id);
        return ResponseEntity.ok(admin);
    }

    /**
     * Delete an admin (cannot delete self)
     */
    @DeleteMapping("/admins/{id}")
    public ResponseEntity<Map<String, String>> deleteAdmin(
            @PathVariable String id,
            Authentication authentication) {
        String currentAdminId = authentication.getName();
        adminService.deleteAdmin(id, currentAdminId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ==================== PICKUP REQUEST MANAGEMENT ====================

    /**
     * Get all pickup requests
     */
    @GetMapping("/pickup-requests")
    public ResponseEntity<List<PickupRequest>> getAllPickupRequests() {
        List<PickupRequest> requests = pickupRequestService.getAllPickupRequests();
        return ResponseEntity.ok(requests);
    }

    /**
     * Get pickup request by ID
     */
    @GetMapping("/pickup-requests/{id}")
    public ResponseEntity<PickupRequest> getPickupRequestById(@PathVariable String id) {
        PickupRequest request = pickupRequestService.getPickupRequestById(id);
        return ResponseEntity.ok(request);
    }

    /**
     * Get pickup requests by status
     */
    @GetMapping("/pickup-requests/status/{status}")
    public ResponseEntity<List<PickupRequest>> getPickupRequestsByStatus(@PathVariable String status) {
        List<PickupRequest> requests = pickupRequestService.getPickupRequestsByStatus(status);
        return ResponseEntity.ok(requests);
    }

    /**
     * Approve a pickup request
     */
    @PutMapping("/pickup-requests/{id}/approve")
    public ResponseEntity<Map<String, String>> approvePickupRequest(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {
        String adminNotes = body != null ? body.get("adminNotes") : "";
        String assignedTo = body != null ? body.get("assignedTo") : "";
        
        pickupRequestService.approvePickupRequest(id, adminNotes, assignedTo);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Pickup request accepted and set to IN PROGRESS. User has been notified.");
        return ResponseEntity.ok(response);
    }

    /**
     * Reject a pickup request
     */
    @PutMapping("/pickup-requests/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectPickupRequest(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        
        pickupRequestService.rejectPickupRequest(id, reason);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Pickup request rejected. User has been notified.");
        return ResponseEntity.ok(response);
    }

    /**
     * Update pickup request status
     */
    @PutMapping("/pickup-requests/{id}")
    public ResponseEntity<PickupRequest> updatePickupRequestStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String adminNotes = body.get("adminNotes");
        
        PickupRequest updatedRequest = pickupRequestService.updatePickupRequestStatus(id, status, adminNotes);
        return ResponseEntity.ok(updatedRequest);
    }

    /**
     * Update pickup request date
     */
    @PutMapping("/pickup-requests/{id}/update-date")
    public ResponseEntity<Map<String, String>> updatePickupRequestDate(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String newDateStr = body.get("pickupDate");
        String reason = body.get("reason");
        
        pickupRequestService.updatePickupDate(id, newDateStr, reason);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Pickup date updated successfully. User has been notified.");
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a pickup request
     */
    @DeleteMapping("/pickup-requests/{id}")
    public ResponseEntity<Map<String, String>> deletePickupRequest(@PathVariable String id) {
        pickupRequestService.deletePickupRequest(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Pickup request deleted successfully");
        return ResponseEntity.ok(response);
    }
}
