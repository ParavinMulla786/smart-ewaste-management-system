package com.ewaste.service;

import com.ewaste.dto.CreateReportRequest;
import com.ewaste.dto.ReportResponse;
import com.ewaste.dto.UpdateReportRequest;
import com.ewaste.model.Report;
import com.ewaste.model.User;
import com.ewaste.repository.ReportRepository;
import com.ewaste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Report Service
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    /**
     * Create a new report
     */
    @Transactional
    public ReportResponse createReport(CreateReportRequest request, String userId) {
        // Get user details
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create report
        Report report = new Report();
        report.setUserId(userId);
        report.setUserName(user.getName());
        report.setUserEmail(user.getEmail());
        report.setReportType(request.getReportType());
        report.setSubject(request.getSubject());
        report.setDescription(request.getDescription());
        report.setStatus("PENDING");
        report.setCreatedAt(LocalDateTime.now());

        Report savedReport = reportRepository.save(report);
        return ReportResponse.fromReport(savedReport);
    }

    /**
     * Get all reports
     */
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAll()
                .stream()
                .map(ReportResponse::fromReport)
                .collect(Collectors.toList());
    }

    /**
     * Get report by ID
     */
    public ReportResponse getReportById(String id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        return ReportResponse.fromReport(report);
    }

    /**
     * Get reports by user ID
     */
    public List<ReportResponse> getReportsByUserId(String userId) {
        return reportRepository.findByUserId(userId)
                .stream()
                .map(ReportResponse::fromReport)
                .collect(Collectors.toList());
    }

    /**
     * Get reports by status
     */
    public List<ReportResponse> getReportsByStatus(String status) {
        return reportRepository.findByStatus(status)
                .stream()
                .map(ReportResponse::fromReport)
                .collect(Collectors.toList());
    }

    /**
     * Update report status and notes (admin only)
     */
    @Transactional
    public ReportResponse updateReport(String id, UpdateReportRequest request, String adminId) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (request.getStatus() != null) {
            report.setStatus(request.getStatus());
            if ("RESOLVED".equals(request.getStatus()) || "CLOSED".equals(request.getStatus())) {
                report.setResolvedAt(LocalDateTime.now());
            }
        }

        if (request.getAdminNotes() != null) {
            report.setAdminNotes(request.getAdminNotes());
        }

        report.setAssignedTo(adminId);

        Report updatedReport = reportRepository.save(report);
        return ReportResponse.fromReport(updatedReport);
    }

    /**
     * Delete report (admin only)
     */
    @Transactional
    public void deleteReport(String id) {
        if (!reportRepository.existsById(id)) {
            throw new RuntimeException("Report not found");
        }
        reportRepository.deleteById(id);
    }

    /**
     * Get reports assigned to admin
     */
    public List<ReportResponse> getAssignedReports(String adminId) {
        return reportRepository.findByAssignedTo(adminId)
                .stream()
                .map(ReportResponse::fromReport)
                .collect(Collectors.toList());
    }
}
