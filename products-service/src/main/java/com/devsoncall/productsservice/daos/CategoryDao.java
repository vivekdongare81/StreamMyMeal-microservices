package com.devsoncall.productsservice.daos;

import org.springframework.stereotype.Component;

import com.devsoncall.productsservice.models.Category;

import java.util.List;

public interface CategoryDao {
    List<Category> GetAll();
    Category GetById(Integer id);
    Category Patch(Category product);
    Category Save(Category prod);
    int Delete(Integer id);
}
