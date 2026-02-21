package com.ewaste.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Report Entity - Represents user reports or complaints
 * 
 * MongoDB Collection: reports
 */
@Document(collection = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    private String id;

    /**
     * User ID who created the report
     */
    private String userId;

    /**
     * User name
     */
    private String userName;

    /**
     * User email
     */
    private String userEmail;

    /**
     * Report type: COMPLAINT, FEEDBACK, ISSUE, OTHER
     */
    private String reportType;

    /**
     * Report subject/title
     */
    private String subject;

    /**
     * Detailed description
     */
    private String description;

    /**
     * Report status: PENDING, IN_PROGRESS, RESOLVED, CLOSED
     */
    private String status = "PENDING";

    /**
     * Admin response/notes
     */
    private String adminNotes;

    /**
     * Admin who is handling this report
     */
    private String assignedTo;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    public Report(String userId, String userName, String userEmail, String reportType, 
                  String subject, String description) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.reportType = reportType;
        this.subject = subject;
        this.description = description;
    }
}
