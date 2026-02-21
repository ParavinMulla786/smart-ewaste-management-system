package com.ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Admin Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminResponse {

    private String id;
    private String name;
    private String email;
    private String role;
    private boolean enabled;
    private String createdAt;
    private String createdBy;

    public static AdminResponse fromAdmin(com.ewaste.model.Admin admin) {
        AdminResponse response = new AdminResponse();
        response.setId(admin.getId());
        response.setName(admin.getName());
        response.setEmail(admin.getEmail());
        response.setRole(admin.getRole());
        response.setEnabled(admin.isEnabled());
        response.setCreatedAt(admin.getCreatedAt() != null ? admin.getCreatedAt().toString() : null);
        response.setCreatedBy(admin.getCreatedBy());
        return response;
    }
}
