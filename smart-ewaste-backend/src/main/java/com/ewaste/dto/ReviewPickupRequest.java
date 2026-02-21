package com.ewaste.dto;

import lombok.Data;

/**
 * DTO for admin review of completed pickup
 */
@Data
public class ReviewPickupRequest {
    private String requestId;
    private boolean approved;
    private String reviewNotes;
}
