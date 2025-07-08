package com.devsoncall.productsservice.requests;

public record CreateSubCategoryRequest(Integer id, Integer categoryId, String name) {
}
