package com.devsoncall.streammymeal.restaurant.service;

import com.devsoncall.streammymeal.restaurant.dto.MenuItemDTO;
import com.devsoncall.streammymeal.restaurant.entity.MenuItem;
import com.devsoncall.streammymeal.restaurant.entity.Restaurant;
import com.devsoncall.streammymeal.restaurant.exception.RestaurantNotFoundException;
import com.devsoncall.streammymeal.restaurant.repository.MenuItemRepository;
import com.devsoncall.streammymeal.restaurant.repository.RestaurantRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MenuItemService {
    private final MenuItemRepository menuItemRepository;
    private final FileStorageService imageService;
    private final RestaurantRepository restaurantRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    @Cacheable(value = "menuItems", key = "#restaurant.restaurantId")
    public List<MenuItemDTO> getMenuItemsByRestaurantId(Restaurant restaurant) {
        List<MenuItem> menuItems = menuItemRepository.findByRestaurant(restaurant);
        return menuItems.stream()
                .map(this::toDTO)
                .toList();
    }

    public MenuItemDTO createMenuItem (MenuItemDTO menuItemDTO, Integer restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RestaurantNotFoundException("Restaurant not found"));
        MenuItem menuItem = new MenuItem(
                menuItemDTO.menuItemId(),
                menuItemDTO.name(),
                menuItemDTO.price(),
                menuItemDTO.stock(),
                menuItemDTO.imageUrl(),
                restaurant
        );
        menuItemRepository.save(menuItem);
        return toDTO(menuItem);
    }

    public MenuItemDTO uploadImage(Integer menuItemId, MultipartFile file) throws IOException {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RestaurantNotFoundException("Menu item not found"));

        String oldImageFileName = menuItem.getImageUrl();

        String fileName = imageService.uploadMenuImage(file ,oldImageFileName);

        menuItem.setImageUrl(fileName);
        menuItemRepository.save(menuItem);
        return toDTO(menuItem);
    }

    public BigDecimal getPriceByMenuItemId(Integer menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RestaurantNotFoundException("Menu item not found"));
        return menuItem.getPrice();
    }

    private MenuItemDTO toDTO(MenuItem menuItem) {
        String imageUrl = Optional.ofNullable(menuItem.getImageUrl())
                .map(fileName -> baseUrl + "/api/v1/menu-items/images/" + fileName)
                .orElse(null);
        return new MenuItemDTO(
                menuItem.getItemId(),
                menuItem.getName(),
                menuItem.getPrice(),
                menuItem.getStock(),
                imageUrl
        );
    }

}
