package com.devsoncall.streammymeal.order.dto;

import lombok.Data;

@Data
public class OrderItemRequest {
    private Integer menuItemId;
    private Integer quantity;
}
