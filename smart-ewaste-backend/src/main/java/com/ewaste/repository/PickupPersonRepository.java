package com.ewaste.repository;

import com.ewaste.model.PickupPerson;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for PickupPerson entity
 */
@Repository
public interface PickupPersonRepository extends MongoRepository<PickupPerson, String> {
    
    /**
     * Find pickup person by email
     */
    Optional<PickupPerson> findByEmail(String email);
    
    /**
     * Find all active pickup persons
     */
    List<PickupPerson> findByIsActive(boolean isActive);
    
    /**
     * Check if email already exists
     */
    boolean existsByEmail(String email);
    
    /**
     * Find pickup persons by area
     */
    List<PickupPerson> findByArea(String area);
}
