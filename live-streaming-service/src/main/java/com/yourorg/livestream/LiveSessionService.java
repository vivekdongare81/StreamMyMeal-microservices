package com.yourorg.livestream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;

@Service
public class LiveSessionService {
    private final LiveSessionRepository repository;
    private final RestTemplate restTemplate;
    @Value("${sfu.api.url}")
    private String sfuApiUrl;

    @Autowired
    public LiveSessionService(LiveSessionRepository repository, RestTemplate restTemplate) {
        this.repository = repository;
        this.restTemplate = restTemplate;
    }

    @Transactional
    public LiveSession startSession(String restaurantId, String broadcastId) {
        Optional<LiveSession> existing = repository.findByRestaurantId(restaurantId);
        LiveSession session = existing.orElse(
            LiveSession.builder()
                .restaurantId(restaurantId)
                .roomId(broadcastId)
                .build()
        );
        session.setLive(true);
        session.setStartedAt(LocalDateTime.now());
        session.setEndedAt(null);
        session = repository.save(session);
        // Call SFU to create/start the broadcast
        try {
            restTemplate.postForEntity(sfuApiUrl, Map.of("broadcastId", broadcastId), Void.class);
        } catch (Exception e) {
            // Optionally log or handle error
        }
        return session;
    }

    @Transactional
    public void stopSession(String restaurantId) {
        repository.findByRestaurantId(restaurantId).ifPresent(session -> {
            session.setLive(false);
            session.setEndedAt(LocalDateTime.now());
            repository.save(session);
        });
    }

    public Optional<LiveSession> getByRestaurantId(String restaurantId) {
        return repository.findByRestaurantId(restaurantId);
    }

    public Optional<LiveSession> getByRoomId(String roomId) {
        return repository.findByRoomId(roomId);
    }

    public List<LiveSession> getAllLiveSessions() {
        return repository.findByIsLiveTrue();
    }
} 