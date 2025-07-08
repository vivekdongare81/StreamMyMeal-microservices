package com.devsoncall.restaurantsservice.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document
public class Restaurant {
    @Id
    private Integer id;
    private String name;
    private String address;
    private String opens;
    private String closes;
}
