package com.ewaste.util;

import com.ewaste.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Database Initializer
 * Creates default admin account on application startup
 */
@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final AdminService adminService;

    @Override
    public void run(String... args) throws Exception {
        // Create default admin if not exists
        adminService.createDefaultAdmin();
        System.out.println("✓ Default admin check completed");
    }
}
