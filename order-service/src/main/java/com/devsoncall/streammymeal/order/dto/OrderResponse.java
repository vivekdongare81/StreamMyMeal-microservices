package com.devsoncall.streammymeal.order.dto;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Integer orderId;
    private Integer userId;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String status;
    private String paymentStatus;
    private String recipientName;
    private String contactEmail;
    private String shippingAddress;
    private String contactPhone;
    private List<OrderItemResponse> items;

}