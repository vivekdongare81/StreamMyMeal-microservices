package com.devsoncall.productsservice.controllers;


import com.devsoncall.productsservice.models.Product;
import com.devsoncall.productsservice.requests.CheckoutOrderRequest;
import com.devsoncall.productsservice.requests.CreateProductRequest;
import com.devsoncall.productsservice.requests.FindProductRequest;
import com.devsoncall.productsservice.requests.PatchProductRequest;
import com.devsoncall.productsservice.services.IProductService;
import com.devsoncall.productsservice.services.ProductService;

import jakarta.ws.rs.QueryParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Slf4j
@RestController
@RequestMapping("product")
public class ProductsController {
    @Autowired
    private IProductService service;

    @GetMapping
    public ResponseEntity<Object> GetProducts(){

        var result = service.GetProducts();

        return ResponseEntity.ok(result);
    }

    @PostMapping("/findProduct")
    public ResponseEntity<Object> FindProduct(@RequestBody FindProductRequest request){

        if(request == null)
            return new ResponseEntity ("You have to pass a valid request", HttpStatus.BAD_REQUEST);

        var result = service.FindProduct(request);

        if(result==null)
            return new ResponseEntity ("Product with the given id was not found", HttpStatus.NOT_FOUND);

        return ResponseEntity.ok(result);
    }

    @DeleteMapping
    public ResponseEntity<Object> Delete(@QueryParam("id") Integer id){
        if(id == 0 || id == null)
            return new ResponseEntity ("You have to pass a valid id", HttpStatus.BAD_REQUEST);

        var result = service.DeleteProduct(id);

        if(result==0)
            return new ResponseEntity ("Product with the given id was not found", HttpStatus.NOT_FOUND);

        return ResponseEntity.ok(result);
    }

    @PatchMapping
    public ResponseEntity<Object> PatchProduct(@RequestBody PatchProductRequest request){
        if(request == null)
            return new ResponseEntity ("You have to pass a valid request", HttpStatus.BAD_REQUEST);

        var result = service.PatchProduct(request);

        if(result==null)
            return new ResponseEntity ("Product with the given id was not found", HttpStatus.NOT_FOUND);

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Object> CreateProduct(@RequestBody CreateProductRequest request){

        if(request == null)
            return new ResponseEntity ("You have to pass a valid request", HttpStatus.BAD_REQUEST);

        try {
            var result = service.CreateProduct(request);
            return ResponseEntity.ok(result);

        }catch (Exception ex){
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<List<Product>> CheckoutOrder(@RequestBody CheckoutOrderRequest request){
        var result = service.CheckoutOrder(request);

        return ResponseEntity.ok(result);
    }
}
