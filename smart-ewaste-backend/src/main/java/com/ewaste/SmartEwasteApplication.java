package com.ewaste;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Application Class for Smart e-Waste Collection & Management System
 * 
 * @SpringBootApplication: Combines @Configuration, @EnableAutoConfiguration, and @ComponentScan
 * @EnableMongoAuditing: Enables automatic timestamp management (createdAt, updatedAt)
 * @EnableScheduling: Enables scheduled tasks for automatic processing
 * 
 * This is the entry point of the Spring Boot application.
 */
@SpringBootApplication
@EnableMongoAuditing
@EnableScheduling
public class SmartEwasteApplication {

    /**
     * Main method - starts the Spring Boot application
     * 
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(SmartEwasteApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("🚀 Smart e-Waste Backend Started!");
        System.out.println("📍 Running on: http://localhost:8080");
        System.out.println("📚 API Docs: http://localhost:8080/api");
        System.out.println("========================================\n");
    }
}
