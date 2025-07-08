package com.devsoncall.productsservice.daos;

import com.devsoncall.productsservice.models.Product;
import com.devsoncall.productsservice.requests.FindProductRequest;

import java.util.List;

public interface ProductDao {
    List<Product> GetAll();
    Product FindProduct(FindProductRequest request);
    Product Patch(Product product);
    Product Save(Product prod);
    int Delete(Integer id);
}
