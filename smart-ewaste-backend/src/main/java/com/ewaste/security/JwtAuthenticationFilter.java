package com.ewaste.security;

import com.ewaste.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter
 * 
 * This filter intercepts every HTTP request and validates the JWT token.
 * If valid, it sets the authentication in the SecurityContext.
 * 
 * Flow:
 * 1. Extract JWT from Authorization header
 * 2. Validate token and extract username
 * 3. Load user details from database
 * 4. Create authentication object
 * 5. Set authentication in SecurityContext
 * 6. Continue filter chain
 * 
 * Extends OncePerRequestFilter to ensure single execution per request.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    /**
     * Main filter method - executes on every request
     * 
     * @param request HTTP request
     * @param response HTTP response
     * @param filterChain Filter chain to continue
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip JWT authentication for public endpoints
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract Authorization header
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // Check if Authorization header exists and starts with "Bearer "
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            // Extract token (remove "Bearer " prefix)
            jwt = authorizationHeader.substring(7);
            
            try {
                // Extract username from token
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                // Log invalid token (will be caught by exception handler)
                logger.error("JWT Token extraction failed: " + e.getMessage());
            }
        }

        // If username is extracted and no authentication exists in context
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Load user details from database
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // Validate token
            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                
                // Create authentication token
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // Set additional details
                authenticationToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Set authentication in SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                
                logger.info("JWT validated successfully for user: " + username);
            } else {
                logger.warn("JWT validation failed for user: " + username);
            }
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}
