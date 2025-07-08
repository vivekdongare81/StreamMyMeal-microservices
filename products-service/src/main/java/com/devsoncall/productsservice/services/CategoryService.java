package com.devsoncall.productsservice.services;

import com.devsoncall.productsservice.daos.CategoryDaoImpl;
import com.devsoncall.productsservice.models.Category;
import com.devsoncall.productsservice.requests.CreateCategoryRequest;
import com.devsoncall.productsservice.requests.PatchCategoryRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService implements ICategoryService{

    @Autowired
    private CategoryDaoImpl dao;
    @Override
    public List<Category> GetCategories() {

        var result = dao.GetAll();

        return result;
    }

    @Override
    public Category GetCategoryById(Integer id) {

        var result = dao.GetById(id);

        return result;
    }

    @Override
    public int DeleteCategory(Integer id) {

        var result = dao.Delete(id);

        return result;
    }

    @Override
    public Category CreateCategory(CreateCategoryRequest request) {

        var category = Category.builder().name(request.name()).id(request.id()).build();

        var result = dao.Save(category);

        return result;
    }

    @Override
    public Category PatchCategory(PatchCategoryRequest request) {
        var category = Category.builder().name(request.name()).id(request.id()).build();

        var result = dao.Patch(category);

        return result;
    }
}
