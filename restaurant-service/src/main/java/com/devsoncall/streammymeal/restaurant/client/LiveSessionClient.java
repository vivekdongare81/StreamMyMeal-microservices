package com.devsoncall.streammymeal.restaurant.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;

@FeignClient(name = "live-streaming-service", url = "${live-streaming.service.url:http://localhost:8086}")
public interface LiveSessionClient {
    @DeleteMapping("/api/v1/live-sessions/by-restaurant/{restaurantId}")
    void deleteSessionsByRestaurant(@PathVariable("restaurantId") Integer restaurantId);

    @PostMapping("/api/v1/live-sessions/create-for-restaurant")
    ResponseEntity<Object> createSessionForNewRestaurant(@RequestParam("restaurantId") Integer restaurantId);
} 