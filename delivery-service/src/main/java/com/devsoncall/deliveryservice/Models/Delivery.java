package com.devsoncall.deliveryservice.Models;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

public class Delivery {

    @Getter
    @Setter
    @Min(1)
    @NotNull
    @NotBlank
    private Integer id;

    @Getter
    @Setter
    @NotNull
    @NotBlank
    @Min(1)
    private Integer orderId;

    @Getter
    @Setter
    @NotNull
    @NotBlank
    @Min(1)
    private Integer restaurantId;

    @Getter
    @Setter
    @NotNull
    @NotBlank
    private String state;
}
