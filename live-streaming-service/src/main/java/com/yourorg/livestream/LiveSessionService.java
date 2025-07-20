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

    /**
     * Start a new live streaming session
     */
    @Transactional
    public LiveSession startSession(Integer restaurantId, String broadcastId) {
        // Check if restaurant already has an active session
        Optional<LiveSession> existing = repository.findByRestaurantId(restaurantId);
        if (existing.isPresent() && existing.get().isLive()) {
            throw new IllegalStateException("Restaurant " + restaurantId + " already has an active live session");
        }

        LiveSession session = LiveSession.builder()
            .restaurantId(restaurantId)
            .broadcastId(broadcastId)
            .isLive(true)
            .startedAt(LocalDateTime.now())
            .endedAt(null)
            .viewersCount(0)
            .build();

        session = repository.save(session);
        
        // Call SFU to create/start the broadcast
        try {
            restTemplate.postForEntity(sfuApiUrl, Map.of("broadcastId", broadcastId), Void.class);
        } catch (Exception e) {
            // Log error but don't fail the session creation
            System.err.println("Failed to call SFU API: " + e.getMessage());
        }
        
        return session;
    }

    /**
     * Stop an active live streaming session
     */
    @Transactional
    public LiveSession stopSession(Integer restaurantId) {
        Optional<LiveSession> existing = repository.findByRestaurantId(restaurantId);
        if (existing.isEmpty() || !existing.get().isLive()) {
            throw new IllegalStateException("No active live session found for restaurant " + restaurantId);
        }

        LiveSession session = existing.get();
        session.setLive(false);
        session.setEndedAt(LocalDateTime.now());
        return repository.save(session);
    }

    /**
     * Update viewer count for a live session
     */
    @Transactional
    public LiveSession updateViewerCount(Integer restaurantId, Integer newViewerCount) {
        Optional<LiveSession> existing = repository.findByRestaurantId(restaurantId);
        if (existing.isEmpty()) {
            throw new IllegalStateException("No live session found for restaurant " + restaurantId);
        }

        LiveSession session = existing.get();
        session.setViewersCount(newViewerCount);
        return repository.save(session);
    }

    /**
     * Create a new live session (manual creation)
     */
    @Transactional
    public LiveSession createSession(Integer restaurantId, String broadcastId, boolean isLive) {
        // Check if broadcast ID already exists
        Optional<LiveSession> existing = repository.findByBroadcastId(broadcastId);
        if (existing.isPresent()) {
            throw new IllegalStateException("Broadcast ID " + broadcastId + " already exists");
        }

        LiveSession session = LiveSession.builder()
            .restaurantId(restaurantId)
            .broadcastId(broadcastId)
            .isLive(isLive)
            .startedAt(isLive ? LocalDateTime.now() : null)
            .endedAt(null)
            .viewersCount(0)
            .build();

        return repository.save(session);
    }

    /**
     * Create a live session for a new restaurant (called when restaurant is created)
     */
    @Transactional
    public LiveSession createSessionForNewRestaurant(Integer restaurantId) {
        // Check if restaurant already has a session
        Optional<LiveSession> existing = repository.findByRestaurantId(restaurantId);
        if (existing.isPresent()) {
            // If session exists, just return it
            return existing.get();
        }

        // Create a new inactive session for the restaurant
        String broadcastId = "broadcast-" + restaurantId + "-" + System.currentTimeMillis();
        LiveSession session = LiveSession.builder()
            .restaurantId(restaurantId)
            .broadcastId(broadcastId)
            .isLive(true) // Start as inactive
            .startedAt(null)
            .endedAt(null)
            .viewersCount(0)
            .build();

        return repository.save(session);
    }

    /**
     * Save or update a live session
     */
    @Transactional
    public LiveSession saveSession(LiveSession session) {
        return repository.save(session);
    }

    /**
     * Get live session by restaurant ID
     */
    public Optional<LiveSession> getByRestaurantId(Integer restaurantId) {
        return repository.findByRestaurantId(restaurantId);
    }

    /**
     * Get live session by broadcast ID
     */
    public Optional<LiveSession> getByBroadcastId(String broadcastId) {
        return repository.findByBroadcastId(broadcastId);
    }

    /**
     * Get all currently live sessions
     */
    public List<LiveSession> getAllLiveSessions() {
        return repository.findByIsLiveTrue();
    }

    /**
     * Get live streaming history for a restaurant
     */
    public List<LiveSession> getRestaurantHistory(Integer restaurantId) {
        return repository.findByRestaurantIdOrderByStartedAtDesc(restaurantId);
    }

    /**
     * Get all sessions (for admin purposes)
     */
    public List<LiveSession> getAllSessions() {
        return repository.findAll();
    }

    public void deleteSessionsByRestaurant(Integer restaurantId) {
        repository.deleteAll(repository.findByRestaurantId(restaurantId).stream().toList());
    }
} 