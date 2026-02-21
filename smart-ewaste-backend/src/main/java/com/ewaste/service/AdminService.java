package com.ewaste.service;

import com.ewaste.dto.AdminResponse;
import com.ewaste.dto.CreateAdminRequest;
import com.ewaste.model.Admin;
import com.ewaste.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin Service
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Create a new admin
     */
    @Transactional
    public AdminResponse createAdmin(CreateAdminRequest request, String createdBy) {
        // Check if email already exists
        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Admin with this email already exists");
        }

        // Create admin entity
        Admin admin = new Admin();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setRole("ADMIN");
        admin.setEnabled(true);
        admin.setCreatedBy(createdBy);
        admin.setCreatedAt(LocalDateTime.now());

        // Save admin
        Admin savedAdmin = adminRepository.save(admin);

        return AdminResponse.fromAdmin(savedAdmin);
    }

    /**
     * Get all admins
     */
    public List<AdminResponse> getAllAdmins() {
        return adminRepository.findAll()
                .stream()
                .map(AdminResponse::fromAdmin)
                .collect(Collectors.toList());
    }

    /**
     * Get admin by ID
     */
    public AdminResponse getAdminById(String id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        return AdminResponse.fromAdmin(admin);
    }

    /**
     * Get admin by email
     */
    public Admin getAdminByEmail(String email) {
        return adminRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found with email: " + email));
    }

    /**
     * Delete admin (cannot delete self or default admin)
     */
    @Transactional
    public void deleteAdmin(String id, String currentAdminId) {
        if (id.equals(currentAdminId)) {
            throw new RuntimeException("Cannot delete yourself");
        }

        if (!adminRepository.existsById(id)) {
            throw new RuntimeException("Admin not found with id: " + id);
        }

        // Prevent deletion of default admin account
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        
        if ("cleanstreet02@gmail.com".equals(admin.getEmail())) {
            throw new RuntimeException("Cannot delete the default admin account");
        }

        adminRepository.deleteById(id);
    }

    /**
     * Check if admin exists by email
     */
    public boolean existsByEmail(String email) {
        return adminRepository.existsByEmail(email);
    }

    /**
     * Create default admin if not exists
     */
    @Transactional
    public void createDefaultAdmin() {
        String defaultEmail = "cleanstreet02@gmail.com";
        if (!adminRepository.existsByEmail(defaultEmail)) {
            Admin admin = new Admin();
            admin.setName("System Admin");
            admin.setEmail(defaultEmail);
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole("ADMIN");
            admin.setEnabled(true);
            admin.setCreatedAt(LocalDateTime.now());
            adminRepository.save(admin);
        }
    }
}
