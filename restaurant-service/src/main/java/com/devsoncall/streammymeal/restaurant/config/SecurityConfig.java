package com.devsoncall.streammymeal.restaurant.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/api/v1/restaurants/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/menu-items/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/restaurants/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );
        return http.build();
    }
} 