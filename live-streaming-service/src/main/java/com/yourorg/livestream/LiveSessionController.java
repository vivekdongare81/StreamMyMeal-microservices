package com.yourorg.livestream;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/live-sessions")
public class LiveSessionController {
    private final LiveSessionService service;

    public LiveSessionController(LiveSessionService service) {
        this.service = service;
    }

    @PostMapping("/start")
    public ResponseEntity<LiveSession> startSession(@RequestParam String restaurantId, @RequestParam String roomId) {
        LiveSession session = service.startSession(restaurantId, roomId);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/stop")
    public ResponseEntity<Void> stopSession(@RequestParam String restaurantId) {
        service.stopSession(restaurantId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/by-restaurant")
    public ResponseEntity<LiveSession> getByRestaurantId(@RequestParam String restaurantId) {
        return service.getByRestaurantId(restaurantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public List<LiveSession> getAllLiveSessions() {
        return service.getAllLiveSessions();
    }
} 