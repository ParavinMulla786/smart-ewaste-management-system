package com.ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Update Report Status Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReportRequest {

    private String status; // PENDING, IN_PROGRESS, COMPLETED, CLOSED
    private String adminNotes;
}
