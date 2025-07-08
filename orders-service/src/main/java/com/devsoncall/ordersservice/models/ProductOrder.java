package com.devsoncall.ordersservice.models;

import lombok.Data;

@Data
public class ProductOrder {
    private Integer id;
    //private List<Integer> items;
    private String date;
    private Double total_order_price;

}
