package com.devsoncall.streammymeal.restaurant.service;

import com.devsoncall.streammymeal.restaurant.dto.RestaurantDTO;
import com.devsoncall.streammymeal.restaurant.entity.Restaurant;
import com.devsoncall.streammymeal.restaurant.exception.RestaurantNotFoundException;
import com.devsoncall.streammymeal.restaurant.repository.RestaurantRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestaurantService {
    private final RestaurantRepository restaurantRepository;
    private final FileStorageService fileStorageService;

    @Value("${app.base-url}")
    private String baseUrl;

    public RestaurantDTO createRestaurant(RestaurantDTO restaurantDTO) {
        Restaurant restaurant = new Restaurant(
                restaurantDTO.restaurantId(),
                restaurantDTO.name(),
                restaurantDTO.address(),
                restaurantDTO.image()
        );
        restaurantRepository.save(restaurant);
        return toDTO(restaurant);
    }

    public List<RestaurantDTO> getAllRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    // upload image for restaurant
    public RestaurantDTO uploadImage(Integer restaurantId, MultipartFile file) throws IOException {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RestaurantNotFoundException("Restaurant not found"));

        // Get old image filename before updating
        String oldImageFileName = restaurant.getImage();

        String newImageFileName = fileStorageService.uploadImage(file, oldImageFileName);

        restaurant.setImage(newImageFileName);
        restaurantRepository.save(restaurant);

        log.info("Successfully updated image for restaurant {}: {} -> {}",
                restaurantId, oldImageFileName, newImageFileName);
        return toDTO(restaurant);
    }

    @Cacheable(value = "restaurants" , key = "#pageable.pageNumber")
    public Page<RestaurantDTO> getRestaurantsByPage(Pageable pageable) {
        return restaurantRepository.findAll(pageable)
                .map(this::toDTO);
    }
    
    public RestaurantDTO toDTO(Restaurant restaurant) {
        String imageUrl = Optional.ofNullable(restaurant.getImage())
                .map(fileName -> baseUrl + "/api/v1/restaurants/images/" + fileName)
                .orElse(null);
        return new RestaurantDTO(
                restaurant.getRestaurantId(),
                restaurant.getName(),
                restaurant.getAddress(),
                imageUrl
        );
    }

    @Cacheable(value = "restaurant", key = "#restaurantId")
    public Restaurant getRestaurantById(Integer restaurantId) {
        return restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RestaurantNotFoundException("Restaurant not found"));
    }

    public Page<RestaurantDTO> searchRestaurants(String keyword, Pageable pageable) {
        // Handle null or empty keyword by setting it to null to trigger 'all results' behavior
        if (keyword == null || keyword.trim().isEmpty()) {
            keyword = null;
        }
        return restaurantRepository.searchByKeyword(keyword, pageable)
                .map(this::toDTO);
    }
}
