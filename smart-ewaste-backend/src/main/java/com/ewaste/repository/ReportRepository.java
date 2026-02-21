package com.ewaste.repository;

import com.ewaste.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Report Repository
 */
@Repository
public interface ReportRepository extends MongoRepository<Report, String> {
    
    /**
     * Find reports by user ID
     */
    List<Report> findByUserId(String userId);
    
    /**
     * Find reports by status
     */
    List<Report> findByStatus(String status);
    
    /**
     * Find reports by report type
     */
    List<Report> findByReportType(String reportType);
    
    /**
     * Find reports assigned to specific admin
     */
    List<Report> findByAssignedTo(String adminId);
}
