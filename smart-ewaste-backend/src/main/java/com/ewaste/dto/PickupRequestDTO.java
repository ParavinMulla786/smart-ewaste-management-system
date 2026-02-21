package com.ewaste.dto;

import lombok.Data;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for creating a pickup request
 */
@Data
public class PickupRequestDTO {
    
    @NotBlank(message = "Device type is required")
    private String deviceType;
    
    @NotBlank(message = "Brand is required")
    private String brand;
    
    @NotBlank(message = "Model is required")
    private String model;
    
    @NotBlank(message = "Condition is required")
    private String condition;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;
    
    private String remarks;
    
    private List<String> images;
    
    private LocalDateTime pickupDate;
}
