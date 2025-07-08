package com.devsoncall.productsservice.requests;

public record CreateProductRequest(Integer id,Integer subCategoryId, String name, String description, Double price) {}
