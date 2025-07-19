package com.yourorg.livestream;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String restaurantId;

    @Column(nullable = false, unique = true)
    private String roomId;

    @Column(nullable = false)
    private boolean isLive;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
} 