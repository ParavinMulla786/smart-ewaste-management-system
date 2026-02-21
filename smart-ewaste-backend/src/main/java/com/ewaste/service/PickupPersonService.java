package com.ewaste.service;

import com.ewaste.model.PickupPerson;
import com.ewaste.repository.PickupPersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

/**
 * Service for managing pickup persons
 */
@Service
public class PickupPersonService {

    @Autowired
    private PickupPersonRepository pickupPersonRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Generate a random temporary password
     */
    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }

    /**
     * Register a new pickup person
     * Returns array: [PickupPerson, plainPassword]
     */
    public Object[] registerPickupPerson(PickupPerson pickupPerson) {
        // Check if email already exists
        if (pickupPersonRepository.existsByEmail(pickupPerson.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Generate temporary password if not provided
        String plainPassword;
        if (pickupPerson.getPassword() == null || pickupPerson.getPassword().isEmpty()) {
            plainPassword = generateTemporaryPassword();
            pickupPerson.setPassword(passwordEncoder.encode(plainPassword));
        } else {
            plainPassword = pickupPerson.getPassword();
            pickupPerson.setPassword(passwordEncoder.encode(plainPassword));
        }

        pickupPerson.setCreatedAt(LocalDateTime.now());
        pickupPerson.setUpdatedAt(LocalDateTime.now());
        pickupPerson.setActive(true);
        pickupPerson.setTemporaryPassword(true); // Mark as temporary password requiring change on first login
        pickupPerson.setRole("PICKUP_PERSON");
        pickupPerson.setTotalPickupsCompleted(0);
        pickupPerson.setTotalPickupsPending(0);

        PickupPerson saved = pickupPersonRepository.save(pickupPerson);
        return new Object[]{saved, plainPassword};
    }

    /**
     * Get all pickup persons
     */
    public List<PickupPerson> getAllPickupPersons() {
        return pickupPersonRepository.findAll();
    }

    /**
     * Get all active pickup persons
     */
    public List<PickupPerson> getActivePickupPersons() {
        return pickupPersonRepository.findByIsActive(true);
    }

    /**
     * Get pickup person by ID
     */
    public Optional<PickupPerson> getPickupPersonById(String id) {
        return pickupPersonRepository.findById(id);
    }

    /**
     * Get pickup person by email
     */
    public Optional<PickupPerson> getPickupPersonByEmail(String email) {
        return pickupPersonRepository.findByEmail(email);
    }

    /**
     * Update pickup person
     */
    public PickupPerson updatePickupPerson(String id, PickupPerson updatedPerson) {
        PickupPerson existingPerson = pickupPersonRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pickup person not found"));

        // Update fields
        if (updatedPerson.getName() != null) {
            existingPerson.setName(updatedPerson.getName());
        }
        if (updatedPerson.getPhone() != null) {
            existingPerson.setPhone(updatedPerson.getPhone());
        }
        if (updatedPerson.getArea() != null) {
            existingPerson.setArea(updatedPerson.getArea());
        }
        if (updatedPerson.getVehicleNumber() != null) {
            existingPerson.setVehicleNumber(updatedPerson.getVehicleNumber());
        }
        if (updatedPerson.getVehicleType() != null) {
            existingPerson.setVehicleType(updatedPerson.getVehicleType());
        }
        if (updatedPerson.getPassword() != null && !updatedPerson.getPassword().isEmpty()) {
            existingPerson.setPassword(passwordEncoder.encode(updatedPerson.getPassword()));
        }

        existingPerson.setUpdatedAt(LocalDateTime.now());

        return pickupPersonRepository.save(existingPerson);
    }

    /**
     * Toggle pickup person active status
     */
    public PickupPerson toggleActiveStatus(String id) {
        PickupPerson pickupPerson = pickupPersonRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pickup person not found"));

        pickupPerson.setActive(!pickupPerson.isActive());
        pickupPerson.setUpdatedAt(LocalDateTime.now());

        return pickupPersonRepository.save(pickupPerson);
    }

    /**
     * Delete pickup person
     */
    public void deletePickupPerson(String id) {
        pickupPersonRepository.deleteById(id);
    }

    /**
     * Increment total pickups completed
     */
    public void incrementPickupsCompleted(String id) {
        PickupPerson pickupPerson = pickupPersonRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pickup person not found"));

        pickupPerson.setTotalPickupsCompleted(pickupPerson.getTotalPickupsCompleted() + 1);
        pickupPerson.setUpdatedAt(LocalDateTime.now());

        pickupPersonRepository.save(pickupPerson);
    }

    /**
     * Update pending pickups count
     */
    public void updatePendingPickups(String id, int count) {
        PickupPerson pickupPerson = pickupPersonRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pickup person not found"));

        pickupPerson.setTotalPickupsPending(count);
        pickupPerson.setUpdatedAt(LocalDateTime.now());

        pickupPersonRepository.save(pickupPerson);
    }

    /**
     * Reset password for pickup person and clear temporary flag
     */
    public PickupPerson resetPassword(String email, String oldPassword, String newPassword) {
        PickupPerson pickupPerson = pickupPersonRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Pickup person not found"));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, pickupPerson.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }

        if (newPassword.equals(oldPassword)) {
            throw new RuntimeException("New password must be different from current password");
        }

        // Update password and clear temporary flag
        pickupPerson.setPassword(passwordEncoder.encode(newPassword));
        pickupPerson.setTemporaryPassword(false);
        pickupPerson.setUpdatedAt(LocalDateTime.now());

        return pickupPersonRepository.save(pickupPerson);
    }
}
