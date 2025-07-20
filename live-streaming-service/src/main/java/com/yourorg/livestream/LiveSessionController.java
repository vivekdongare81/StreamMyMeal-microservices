package com.yourorg.livestream;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/live-sessions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class LiveSessionController {
    private final LiveSessionService service;
    private final RestTemplate restTemplate;

    @Autowired
    public LiveSessionController(LiveSessionService service, RestTemplate restTemplate) {
        this.service = service;
        this.restTemplate = restTemplate;
    }

    @PostMapping("/start")
    public ResponseEntity<LiveSession> startSession(@RequestParam String restaurantId, @RequestParam String broadcastId) {
        LiveSession session = service.startSession(Integer.parseInt(restaurantId), broadcastId);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/stop")
    public ResponseEntity<Void> stopSession(@RequestParam String restaurantId) {
        service.stopSession(Integer.parseInt(restaurantId));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/create-for-restaurant")
    public ResponseEntity<LiveSession> createSessionForRestaurant(@RequestParam String restaurantId) {
        try {
            LiveSession session = service.createSessionForNewRestaurant(Integer.parseInt(restaurantId));
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/by-restaurant")
    public ResponseEntity<LiveSession> getByRestaurantId(@RequestParam String restaurantId) {
        return service.getByRestaurantId(Integer.parseInt(restaurantId))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public List<LiveSession> getAllLiveSessions() {
        return service.getAllLiveSessions();
    }

    @GetMapping("/live-restaurants")
    public ResponseEntity<List<Map<String, Object>>> getLiveRestaurants() {
        System.out.println("[DEBUG] getLiveRestaurants endpoint called");
        try {
            List<LiveSession> liveSessions = service.getAllLiveSessions();
            System.out.println("[DEBUG] liveSessions fetched: " + liveSessions.size());
            liveSessions.forEach(ls -> System.out.println("[DEBUG] LiveSession: " + ls));

            List<Map<String, Object>> liveRestaurants = liveSessions.stream()
                .map(session -> {
                    try {
                        String restaurantUrl = "http://localhost:8082/api/v1/restaurants/" + session.getRestaurantId();
                        System.out.println("[DEBUG] Fetching restaurant from: " + restaurantUrl);
                        Map<String, Object> restaurant = restTemplate.getForObject(restaurantUrl, Map.class);
                        System.out.println("[DEBUG] Restaurant fetched: " + restaurant);
                        if (restaurant != null) {
                            Map<String, Object> liveSessionMap = new java.util.HashMap<>();
                            liveSessionMap.put("broadcastId", session.getBroadcastId());
                            liveSessionMap.put("startedAt", session.getStartedAt());
                            liveSessionMap.put("viewersCount", session.getViewersCount());
                            liveSessionMap.put("isLive", session.isLive());
                            restaurant.put("liveSession", liveSessionMap);
                            // Normalize image and thumbnail
                            Object imageObj = restaurant.get("image");
                            String imageUrl = null;
                            if (imageObj != null && !imageObj.toString().isEmpty()) {
                                imageUrl = imageObj.toString();
                                if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://") && !imageUrl.startsWith("/api/v1/restaurants/images/")) {
                                    imageUrl = "/api/v1/restaurants/images/" + imageUrl;
                                }
                            } else {
                                imageUrl = "https://via.placeholder.com/300x200?text=No+Image";
                            }
                            restaurant.put("image", imageUrl);
                            restaurant.put("thumbnail", imageUrl);
                        }
                        return restaurant;
                    } catch (Exception e) {
                        System.err.println("[ERROR] Failed to fetch restaurant " + session.getRestaurantId() + ": " + e.getMessage());
                        e.printStackTrace();
                        Map<String, Object> liveSessionMap = new java.util.HashMap<>();
                        liveSessionMap.put("broadcastId", session.getBroadcastId());
                        liveSessionMap.put("startedAt", session.getStartedAt());
                        liveSessionMap.put("viewersCount", session.getViewersCount());
                        liveSessionMap.put("isLive", session.isLive());
                        return Map.of(
                            "restaurantId", session.getRestaurantId(),
                            "liveSession", liveSessionMap,
                            "error", "Restaurant details not available"
                        );
                    }
                })
                .filter(restaurant -> restaurant != null)
                .collect(Collectors.toList());
            System.out.println("[DEBUG] liveRestaurants list built: " + liveRestaurants.size());
            liveRestaurants.forEach(lr -> {
                System.out.println("[DEBUG] liveRestaurant: " + lr);
                if (lr != null && lr.get("image") != null) {
                    System.out.println("[DEBUG] image path: " + lr.get("image"));
                }
            });
            return ResponseEntity.ok(liveRestaurants);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to get live restaurants: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Return empty list instead of 500
        }
    }

    @DeleteMapping("/by-restaurant/{restaurantId}")
    public ResponseEntity<Void> deleteSessionsByRestaurant(@PathVariable Integer restaurantId) {
        service.deleteSessionsByRestaurant(restaurantId);
        return ResponseEntity.noContent().build();
    }
} 