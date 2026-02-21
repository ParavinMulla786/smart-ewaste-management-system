package com.ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Report Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String reportType;
    private String subject;
    private String description;
    private String status;
    private String adminNotes;
    private String assignedTo;
    private String createdAt;
    private String resolvedAt;

    public static ReportResponse fromReport(com.ewaste.model.Report report) {
        ReportResponse response = new ReportResponse();
        response.setId(report.getId());
        response.setUserId(report.getUserId());
        response.setUserName(report.getUserName());
        response.setUserEmail(report.getUserEmail());
        response.setReportType(report.getReportType());
        response.setSubject(report.getSubject());
        response.setDescription(report.getDescription());
        response.setStatus(report.getStatus());
        response.setAdminNotes(report.getAdminNotes());
        response.setAssignedTo(report.getAssignedTo());
        response.setCreatedAt(report.getCreatedAt() != null ? report.getCreatedAt().toString() : null);
        response.setResolvedAt(report.getResolvedAt() != null ? report.getResolvedAt().toString() : null);
        return response;
    }
}
