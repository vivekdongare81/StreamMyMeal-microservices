package com.devsoncall.deliveryservice.Controllers;

import com.devsoncall.deliveryservice.Models.Delivery;
import com.devsoncall.deliveryservice.Services.DeliveryService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("delivery")
public class DeliveryController {

    @Autowired
    private DeliveryService service;
    @GetMapping
    public List<Delivery> GetAll(){
        List<Delivery> result = service.GetDeliveries();

        return result;
    }
    @GetMapping("/GetById")
    public Delivery GetById(@RequestParam("id") Integer id){
        Delivery result = service.GetDeliveryById(id);

        return result;
    }

    @PostMapping
    public Delivery CreateDelivery(@RequestBody @Valid Delivery delivery){
        Delivery result = service.InsertOneDelivery(delivery);

        return result;
    }

    @DeleteMapping
    public Integer DeleteDelivery(@RequestParam Integer id){
        Integer result = service.DeleteDelivery(id);

        return result;
    }

    @PatchMapping
    public Delivery PatchDelivery(@RequestBody @Valid Delivery delivery)
    {
        var result = service.PatchDelivery(delivery);

        return delivery;
    }
}
