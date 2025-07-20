package com.devsoncall.streammymeal.restaurant.controller;


import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.devsoncall.streammymeal.restaurant.dto.RestaurantDTO;
import com.devsoncall.streammymeal.restaurant.entity.Restaurant;
import com.devsoncall.streammymeal.restaurant.exception.RestaurantNotFoundException;
import com.devsoncall.streammymeal.restaurant.service.FileStorageService;
import com.devsoncall.streammymeal.restaurant.service.RestaurantService;

import org.springframework.security.access.prepost.PreAuthorize;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final FileStorageService imageService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestaurantDTO> createRestaurant(@RequestBody RestaurantDTO restaurantDTO) {
        RestaurantDTO createdRestaurant = restaurantService.createRestaurant(restaurantDTO);
        return new ResponseEntity<>(createdRestaurant ,HttpStatus.CREATED);
    }

    @GetMapping("/{restaurantId}")
    public ResponseEntity<RestaurantDTO> getRestaurantById(@PathVariable Integer restaurantId) {
        try {
            Restaurant restaurant = restaurantService.getRestaurantById(restaurantId);
            RestaurantDTO dto = restaurantService.toDTO(restaurant);
            return ResponseEntity.ok(dto);
        } catch (RestaurantNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<Page<RestaurantDTO>> getAllRestaurants(@RequestParam int page,
                                                                 @RequestParam int size ,
                                                                 @RequestParam(required = false) String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        if (keyword != null && !keyword.isEmpty()) {
            return ResponseEntity.ok(restaurantService.searchRestaurants(keyword, pageable));
        }
        return ResponseEntity.ok(restaurantService.getRestaurantsByPage(pageable));
    }

    @PostMapping("/{restaurantId}/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestaurantDTO> uploadImage(
            @PathVariable Integer restaurantId,
            @RequestParam("file") MultipartFile file) {
        try {
            RestaurantDTO updatedRestaurant = restaurantService.uploadImage(restaurantId, file);
            return ResponseEntity.ok(updatedRestaurant);
        } catch (RestaurantNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{restaurantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Integer restaurantId) {
        try {
            restaurantService.deleteRestaurantById(restaurantId);
            return ResponseEntity.noContent().build();
        } catch (RestaurantNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        Resource resource = imageService.getImage(filename);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000") // Cache for 1 year
                .body(resource);
    }

}
