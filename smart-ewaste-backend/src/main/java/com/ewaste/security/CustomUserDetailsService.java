package com.ewaste.security;

import com.ewaste.repository.UserRepository;
import com.ewaste.repository.AdminRepository;
import com.ewaste.repository.PickupPersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

/**
 * Custom UserDetailsService Implementation
 * 
 * This service is used by Spring Security to load user details during authentication.
 * Integrates with MongoDB to fetch user, admin, or pickup person data.
 * 
 * Required by Spring Security for authentication.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private PickupPersonRepository pickupPersonRepository;

    /**
     * Load user by username (email in our case)
     * 
     * Called by Spring Security during authentication.
     * Checks User, Admin, and PickupPerson repositories.
     * 
     * @param username User's, Admin's, or Pickup Person's email
     * @return UserDetails object for Spring Security
     * @throws UsernameNotFoundException if user/admin/pickup person not found
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        // First, try to find in Admin repository
        Optional<com.ewaste.model.Admin> adminOpt = adminRepository.findByEmail(username);
        if (adminOpt.isPresent()) {
            com.ewaste.model.Admin admin = adminOpt.get();
            return new User(
                    admin.getEmail(),
                    admin.getPassword(),
                    new ArrayList<>() // Empty authorities
            );
        }
        
        // Second, try to find in PickupPerson repository
        Optional<com.ewaste.model.PickupPerson> pickupPersonOpt = pickupPersonRepository.findByEmail(username);
        if (pickupPersonOpt.isPresent()) {
            com.ewaste.model.PickupPerson pickupPerson = pickupPersonOpt.get();
            return new User(
                    pickupPerson.getEmail(),
                    pickupPerson.getPassword(),
                    new ArrayList<>() // Empty authorities
            );
        }
        
        // If not admin or pickup person, find user by email in MongoDB
        com.ewaste.model.User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        // Return Spring Security User object
        // We use email as username, password from DB, and empty authorities list (no roles yet)
        return new User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>() // Empty authorities - can add roles later
        );
    }
}
