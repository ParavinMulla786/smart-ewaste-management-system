package com.ewaste.dto;

import lombok.Data;

/**
 * DTO for assigning pickup person to a request
 */
@Data
public class AssignPickupPersonRequest {
    private String requestId;
    private String pickupPersonId;
}
