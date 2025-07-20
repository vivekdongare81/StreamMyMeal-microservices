package com.devsoncall.streammymeal.restaurant.component;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    
    @Value("${jwt.secretKey}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private Long expiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, java.util.function.Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token) {
        try {
            // Parse JWT token
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (SignatureException | MalformedJwtException | UnsupportedJwtException | IllegalArgumentException ex) {
            logger.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token: {}", ex.getMessage());
        } catch (Exception ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        }
        return false;
    }

    public boolean hasRole(String token, String role) {
        try {
            Claims claims = extractAllClaims(token);
            Object rolesObj = claims.get("roles");
            if (rolesObj != null) {
                // Handle different possible formats of roles
                if (rolesObj instanceof String) {
                    return ((String) rolesObj).contains(role);
                } else if (rolesObj instanceof java.util.List) {
                    java.util.List<?> roles = (java.util.List<?>) rolesObj;
                    return roles.stream().anyMatch(r -> r.toString().contains(role));
                }
            }
        } catch (Exception e) {
            logger.error("Error extracting roles from token: {}", e.getMessage());
        }
        return false;
    }

    public java.util.List<String> extractRoles(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Object rolesObj = claims.get("roles");
            if (rolesObj != null) {
                if (rolesObj instanceof java.util.List<?> rolesList) {
                    // Handle both string and object roles
                    return rolesList.stream()
                        .map(role -> {
                            if (role instanceof String s) return s;
                            if (role instanceof java.util.Map<?,?> map && map.containsKey("authority"))
                                return map.get("authority").toString();
                            return role.toString();
                        })
                        .collect(java.util.stream.Collectors.toList());
                } else if (rolesObj instanceof String) {
                    return java.util.List.of((String) rolesObj);
                }
            }
        } catch (Exception e) {
            logger.error("Error extracting roles from token: {}", e.getMessage());
        }
        return java.util.List.of();
    }
} 