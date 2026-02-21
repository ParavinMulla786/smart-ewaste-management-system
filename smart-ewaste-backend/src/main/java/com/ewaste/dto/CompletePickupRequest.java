package com.ewaste.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for completing a pickup
 */
@Data
public class CompletePickupRequest {
    private String requestId;
    private LocalDateTime actualPickupTime;
    private List<String> collectedEwastePhotos; // URLs of uploaded photos
}
