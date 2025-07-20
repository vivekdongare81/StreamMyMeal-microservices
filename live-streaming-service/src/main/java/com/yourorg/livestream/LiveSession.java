package com.yourorg.livestream;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "live_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "restaurant_id", nullable = false)
    private Integer restaurantId;

    @Column(name = "broadcast_id", nullable = false, unique = true)
    private String broadcastId;

    @Column(name = "is_live", nullable = false)
    @Builder.Default
    private boolean isLive = false;

    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "viewers_count")
    @Builder.Default
    private Integer viewersCount = 0;
} 