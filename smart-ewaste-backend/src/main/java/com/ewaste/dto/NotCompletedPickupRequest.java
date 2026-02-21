package com.ewaste.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO for marking pickup as not completed
 */
@Data
public class NotCompletedPickupRequest {
    private String requestId;
    private String reason;
    private LocalDateTime nextAvailableDate;
}
