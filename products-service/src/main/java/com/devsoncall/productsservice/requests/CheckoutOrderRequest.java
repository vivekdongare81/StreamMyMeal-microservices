package com.devsoncall.productsservice.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

import com.devsoncall.productsservice.models.Product;

@NoArgsConstructor
@AllArgsConstructor
public class CheckoutOrderRequest {

    @NotNull
    @Getter
    @Setter
    private List<Product> products;

    @NotNull
    @Min(1)
    @Getter
    @Setter
    private Integer user_id;
}
