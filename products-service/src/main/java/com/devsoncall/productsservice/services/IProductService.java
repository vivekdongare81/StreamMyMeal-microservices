package com.devsoncall.productsservice.services;

import com.devsoncall.productsservice.models.Product;
import com.devsoncall.productsservice.requests.CheckoutOrderRequest;
import com.devsoncall.productsservice.requests.CreateProductRequest;
import com.devsoncall.productsservice.requests.FindProductRequest;
import com.devsoncall.productsservice.requests.PatchProductRequest;

import java.util.List;

public interface IProductService {
    List<Product> GetProducts();
    int DeleteProduct(Integer id);
    Product CreateProduct(CreateProductRequest request);
    List<Product> CheckoutOrder(CheckoutOrderRequest request);
    Product PatchProduct(PatchProductRequest request);
    Product FindProduct(FindProductRequest request);
}
