package com.devsoncall.streammymeal.users.config;

import com.devsoncall.streammymeal.users.entity.User;
import com.devsoncall.streammymeal.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createAdminUserIfNotExists();
    }

    private void createAdminUserIfNotExists() {
        try {
            Optional<User> existingAdmin = userRepository.findByEmailAndIsActiveTrue("admin@streammymeal.com");
            
            if (existingAdmin.isEmpty()) {
                // Create admin user
                User adminUser = new User();
                adminUser.setUsername("Admin");
                adminUser.setEmail("admin@streammymeal.com");
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setActive(true);
                
                // Set admin role
                Set<String> roles = new HashSet<>();
                roles.add("ROLE_ADMIN");
                adminUser.setRoles(roles);
                
                User savedAdmin = userRepository.save(adminUser);
                log.info("Created admin user with ID: {}", savedAdmin.getUserId());
                log.info("Created admin user successfully: admin@streammymeal.com / admin123");
            } else {
                log.info("Admin user already exists: admin@streammymeal.com");
            }
        } catch (Exception e) {
            log.error("Error creating admin user: {}", e.getMessage());
        }
    }
} 