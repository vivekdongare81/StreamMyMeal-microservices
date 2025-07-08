package com.devsoncall.restaurantsservice.controllers;

import com.devsoncall.restaurantsservice.models.Restaurant;
import com.devsoncall.restaurantsservice.services.RestoService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("restaurant")
@Slf4j
public class RestaurantsController {

    @Autowired
    private RestoService service;

    @GetMapping
    public ResponseEntity<List<Restaurant>> GetAll(){
        List<Restaurant> result = service.GetAll();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/findById")
    public ResponseEntity<Object> FindById(@RequestParam("id") Integer id){

        if(id == 0 || id == null)
            return new ResponseEntity ("You have to pass a valid id", HttpStatus.BAD_REQUEST);

        log.info("Restaurant controller -> getting all customers");

        Restaurant result = service.FindOneById(id);

        log.info("Restaurant controller -> searching restaurant by id");

        if(result==null)
            return new ResponseEntity<>("Customer with given id was not found!", HttpStatusCode.valueOf(404));

        return ResponseEntity.ok(result);
    }

    @DeleteMapping
    public ResponseEntity<Object> Delete(@RequestParam("id") Integer id){

        if(id == 0 || id == null)
            return new ResponseEntity ("You have to pass a valid id", HttpStatus.BAD_REQUEST);

        log.info("Restaurant controller -> getting all customers");

        int result = service.DeleteOne(id);

        log.info("Restaurant controller -> Delete restaurant");


        if(result==0)
            return new ResponseEntity<>("Customer with given id was not found!", HttpStatusCode.valueOf(404));

        return ResponseEntity.ok("Restaurant was successfully deleted");
    }

    @PostMapping
    public ResponseEntity<Restaurant> InsertRestaurant(@RequestBody Restaurant restaurant){

        if(restaurant == null)
            return new ResponseEntity ("You have to pass a valid request", HttpStatus.BAD_REQUEST);

        Restaurant result = service.InsertOne(restaurant);

        log.info("Restaurant controller -> inserting restaurant");

        return ResponseEntity.ok(result);
    }

    @PatchMapping
    public ResponseEntity<String> PatchRestaurant(@RequestBody Restaurant restaurant){

        if(restaurant == null)
            return new ResponseEntity ("You have to pass a valid request", HttpStatus.BAD_REQUEST);

        log.info("Restaurant controller -> patching customer");

        var result = service.PatchOne(restaurant);

        if(result==null)
            return new ResponseEntity<>("Restaurant with given id was not found!", HttpStatusCode.valueOf(404));

        return new ResponseEntity<>("Restaurant was successfully patched!", HttpStatusCode.valueOf(200));
    }
}
