package com.devsoncall.streammymeal.users.service;

import com.devsoncall.streammymeal.users.client.NotificationClient;
import com.devsoncall.streammymeal.users.component.JwtUtil;
import com.devsoncall.streammymeal.users.dto.*;
import com.devsoncall.streammymeal.users.entity.Role;
import com.devsoncall.streammymeal.users.entity.User;
import com.devsoncall.streammymeal.users.exception.AuthException;
import com.devsoncall.streammymeal.users.exception.UserNotFoundException;
import com.devsoncall.streammymeal.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationClient notificationClient;

    public AuthResponse authenticate(LoginRequest loginRequest) {
        try {
            User user = userRepository.findByEmailAndIsActiveTrue(loginRequest.getEmail())
                .orElseThrow(() -> new AuthException("Invalid email or password"));
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                throw new AuthException("Invalid email or password");
            }
            String jwt = jwtUtil.generateToken(user);
            log.info("User {} logged in successfully", loginRequest.getEmail());
            return new AuthResponse(jwt);
        } catch (Exception e) {
            log.warn("Authentication failed for email: {}", loginRequest.getEmail());
            throw new AuthException("Invalid email or password");
        }
    }

    @Transactional
    public RegisterResponse register(RegisterRequest registerRequest) {
        // Validate username and email uniqueness
        validateNewUserCredentials(registerRequest);

        // Create and save new user
        User newUser = createNewUser(registerRequest);
        userRepository.save(newUser);

        // Send welcome email asynchronously
        sendWelcomeEmailAsync(registerRequest);

        log.info("User {} registered successfully", registerRequest.getUsername());
        return new RegisterResponse("User registered successfully");
    }

    private void validateNewUserCredentials(RegisterRequest registerRequest) {
        if (userRepository.findByUsernameAndIsActiveTrue(registerRequest.getUsername()).isPresent()) {
            throw new UserNotFoundException("Username is already taken");
        }
        if (userRepository.findByUsernameAndIsActiveTrue(registerRequest.getEmail()).isPresent()) {
            throw new UserNotFoundException("Email is already in use");
        }
    }

    private User createNewUser(RegisterRequest registerRequest) {
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.getRoles().add(Role.ROLE_USER.name());
        user.isActive();
        return user;
    }

    /**
     * Sends welcome email asynchronously to avoid blocking the registration process.
     */
    private void sendWelcomeEmailAsync(RegisterRequest registerRequest) {
        CompletableFuture.runAsync(() -> {
            EmailRequest emailRequest = new EmailRequest(
                    registerRequest.getEmail(),
                    registerRequest.getUsername()
            );
            notificationClient.sendWelcomeEmail(emailRequest);
        }).exceptionally(ex -> {
            log.error("Failed to send welcome email to {}", registerRequest.getEmail(), ex);
            return null;
        });
    }

}
