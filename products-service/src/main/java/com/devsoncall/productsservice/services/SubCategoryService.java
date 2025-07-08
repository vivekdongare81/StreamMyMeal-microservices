package com.devsoncall.productsservice.services;

import com.devsoncall.productsservice.daos.SubCategoryDao;
import com.devsoncall.productsservice.models.Category;
import com.devsoncall.productsservice.models.SubCategory;
import com.devsoncall.productsservice.requests.CreateSubCategoryRequest;
import com.devsoncall.productsservice.requests.PatchSubCategoryRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubCategoryService implements ISubCategoryService{

    @Autowired
    private SubCategoryDao dao;
    @Override
    public List<SubCategory> GetSubCategories() {

        var result = dao.GetAll();

        return result;
    }

    @Override
    public SubCategory GetSubCategoryById(Integer id) {

        var result = dao.GetById(id);

        return result;
    }

    @Override
    public int DeleteSubCategory(Integer id) {

        var result = dao.Delete(id);

        return result;
    }

    @Override
    public SubCategory CreateSubCategory(CreateSubCategoryRequest request) {

        var subCategory = SubCategory
                .builder()
                .categoryId(request.categoryId())
                .name(request.name())
                .id(request.id())
                .build();

        var result = dao.Save(subCategory);

        return result;
    }

    @Override
    public SubCategory PatchSubCategory(PatchSubCategoryRequest request) {

        var subCategory = SubCategory
                .builder()
                .categoryId(request.categoryId())
                .name(request.name())
                .id(request.id())
                .build();

        var result = dao.Patch(subCategory);

        return result;
    }
}
