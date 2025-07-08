package com.devsoncall.productsservice.requests;

public record PatchSubCategoryRequest(Integer id, Integer categoryId, String name) {
}
