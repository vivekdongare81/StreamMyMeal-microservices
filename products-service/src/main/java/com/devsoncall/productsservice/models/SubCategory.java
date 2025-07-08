package com.devsoncall.productsservice.models;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.redis.core.RedisHash;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("SubCategory")
public class SubCategory implements Serializable {
    private Integer id;
    private String name;
    private Integer categoryId;
}
