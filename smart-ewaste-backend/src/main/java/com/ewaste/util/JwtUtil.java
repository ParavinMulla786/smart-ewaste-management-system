package com.ewaste.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT Utility Class
 * 
 * Handles JWT token generation, validation, and extraction of claims.
 * Uses HMAC-SHA256 algorithm for signing tokens.
 * 
 * Key Methods:
 * - generateToken(): Create JWT from username
 * - validateToken(): Verify JWT signature and expiration
 * - extractUsername(): Get username from token
 */
@Component
public class JwtUtil {

    /**
     * Secret key for signing JWT tokens
     * Loaded from application.properties
     * MUST be at least 256 bits (32 characters)
     */
    @Value("${jwt.secret}")
    private String secret;

    /**
     * JWT expiration time in milliseconds
     * Default: 86400000 ms = 24 hours
     */
    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * Generate signing key from secret
     * 
     * @return Key object for JWT signing
     */
    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Extract username (subject) from JWT token
     * 
     * @param token JWT token
     * @return Username (email in our case)
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract expiration date from JWT token
     * 
     * @param token JWT token
     * @return Expiration date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract specific claim from JWT token
     * 
     * @param token JWT token
     * @param claimsResolver Function to extract specific claim
     * @return Extracted claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract all claims from JWT token
     * 
     * @param token JWT token
     * @return All claims in the token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Check if token is expired
     * 
     * @param token JWT token
     * @return true if expired, false otherwise
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Generate JWT token for a user
     * 
     * @param username User's email (used as subject)
     * @return Generated JWT token
     */
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    /**
     * Create JWT token with claims and subject
     * 
     * @param claims Additional claims to include
     * @param subject Username (email)
     * @return JWT token string
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validate JWT token
     * 
     * Checks:
     * 1. Username in token matches provided username
     * 2. Token is not expired
     * 
     * @param token JWT token
     * @param username Username to validate against
     * @return true if valid, false otherwise
     */
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    /**
     * Validate token without username check
     * Useful for initial validation before extracting username
     * 
     * @param token JWT token
     * @return true if token is valid and not expired
     */
    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
