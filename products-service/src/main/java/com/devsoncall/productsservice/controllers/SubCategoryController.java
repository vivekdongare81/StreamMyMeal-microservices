package com.devsoncall.productsservice.controllers;

import com.devsoncall.productsservice.requests.CreateCategoryRequest;
import com.devsoncall.productsservice.requests.CreateSubCategoryRequest;
import com.devsoncall.productsservice.requests.PatchCategoryRequest;
import com.devsoncall.productsservice.requests.PatchSubCategoryRequest;
import com.devsoncall.productsservice.services.ISubCategoryService;
import com.devsoncall.productsservice.services.SubCategoryService;

import jakarta.ws.rs.QueryParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("subCategory")
public class SubCategoryController {

    @Autowired
    private ISubCategoryService service;

    @GetMapping
    public ResponseEntity<Object> GetProducts(){

        var result = service.GetSubCategories();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/getById")
    public ResponseEntity<Object> FindProduct(@QueryParam("id") Integer id){

        if(id == null || id == 0)
            return new ResponseEntity ("You have to pass a valid id", HttpStatus.BAD_REQUEST);

        var result = service.GetSubCategoryById(id);

        if(result==null)
            return new ResponseEntity ("Product with the given id was not found", HttpStatus.NOT_FOUND);

        return ResponseEntity.ok(result);
    }

    @DeleteMapping
    public ResponseEntity<Object> Delete(@QueryParam("id") Integer id){
        if(id == 0 || id == null)
            return new ResponseEntity ("You have to pass a valid id", HttpStatus.BAD_REQUEST);

        var result = service.DeleteSubCategory(id);

        if(result==0)
            return new ResponseEntity ("Product with the given id was not found", HttpStatus.NOT_FOUND);

        return ResponseEntity.ok(result);
    }

    @PatchMapping
    public ResponseEntity<Object> PatchProduct(@RequestBody PatchSubCategoryRequest request){
        if(request == null)
            return new ResponseEntity ("You have to pass a valid request", HttpStatus.BAD_REQUEST);

        var result = service.PatchSubCategory(request);

        if(result==null)
            return new ResponseEntity ("Product with the given id was not found", HttpStatus.NOT_FOUND);

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Object> CreateProduct(@RequestBody CreateSubCategoryRequest request){

        if(request == null)
            return new ResponseEntity ("You have to pass a valid request", HttpStatus.BAD_REQUEST);

        try {
            var result = service.CreateSubCategory(request);
            return ResponseEntity.ok(result);

        }catch (Exception ex){
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
