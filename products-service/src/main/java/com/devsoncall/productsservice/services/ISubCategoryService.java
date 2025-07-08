package com.devsoncall.productsservice.services;

import com.devsoncall.productsservice.models.Category;
import com.devsoncall.productsservice.models.SubCategory;
import com.devsoncall.productsservice.requests.CreateSubCategoryRequest;
import com.devsoncall.productsservice.requests.PatchSubCategoryRequest;

import java.util.List;

public interface ISubCategoryService {

    List<SubCategory> GetSubCategories();
    SubCategory GetSubCategoryById(Integer id);
    int DeleteSubCategory(Integer id);
    SubCategory CreateSubCategory(CreateSubCategoryRequest request);
    SubCategory PatchSubCategory(PatchSubCategoryRequest request);
}
