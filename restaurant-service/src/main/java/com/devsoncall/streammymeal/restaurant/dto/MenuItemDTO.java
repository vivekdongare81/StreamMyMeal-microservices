package com.devsoncall.streammymeal.restaurant.dto;

import java.math.BigDecimal;

public record MenuItemDTO(
        Integer menuItemId, String name, BigDecimal price, Integer stock , String imageUrl
) {
}
