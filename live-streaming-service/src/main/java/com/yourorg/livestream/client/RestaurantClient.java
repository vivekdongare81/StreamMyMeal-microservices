package com.yourorg.livestream.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "restaurant-service", url = "${restaurant.service.url:http://localhost:8082}")
public interface RestaurantClient {
    @GetMapping("/api/v1/restaurants/{restaurantId}")
    Map<String, Object> getRestaurantById(@PathVariable("restaurantId") Integer restaurantId);
} 