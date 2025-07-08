package com.devsoncall.productsservice.daos;

import java.util.List;

import com.devsoncall.productsservice.models.SubCategory;

public interface SubCategoryDao {

    List<SubCategory> GetAll();
    SubCategory GetById(Integer id);
    SubCategory Patch(SubCategory product);
    SubCategory Save(SubCategory prod);
    int Delete(Integer id);
}
