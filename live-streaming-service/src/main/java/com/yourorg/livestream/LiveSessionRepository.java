package com.yourorg.livestream;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface LiveSessionRepository extends JpaRepository<LiveSession, Long> {
    Optional<LiveSession> findByRestaurantId(Integer restaurantId);
    Optional<LiveSession> findByBroadcastId(String broadcastId);
    List<LiveSession> findByIsLiveTrue();
    List<LiveSession> findByRestaurantIdOrderByStartedAtDesc(Integer restaurantId);
} 