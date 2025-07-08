package com.devsoncall.productsservice.requests;

public record PatchProductRequest(Integer id,String name, String description, Double price,Integer subCategoryId) {
}
