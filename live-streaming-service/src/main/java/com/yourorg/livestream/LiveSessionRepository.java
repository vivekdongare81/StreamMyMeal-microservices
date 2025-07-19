package com.yourorg.livestream;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface LiveSessionRepository extends JpaRepository<LiveSession, Long> {
    Optional<LiveSession> findByRestaurantId(String restaurantId);
    Optional<LiveSession> findByRoomId(String roomId);
    List<LiveSession> findByIsLiveTrue();
} 