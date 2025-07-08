package com.devsoncall.productsservice.services;

import com.devsoncall.productsservice.models.Category;
import com.devsoncall.productsservice.requests.CreateCategoryRequest;
import com.devsoncall.productsservice.requests.PatchCategoryRequest;

import java.util.List;

public interface ICategoryService {
    List<Category> GetCategories();
    Category GetCategoryById(Integer id);
    int DeleteCategory(Integer id);
    Category CreateCategory(CreateCategoryRequest request);
    Category PatchCategory(PatchCategoryRequest request);
}
