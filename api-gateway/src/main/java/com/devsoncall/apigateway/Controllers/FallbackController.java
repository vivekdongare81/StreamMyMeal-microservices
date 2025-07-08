package com.devsoncall.apigateway.Controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FallbackController {

    @RequestMapping("orderFallback")
    public String OrderFallback() {
        return "Gateway fallback -> Order service seems to have a problem processing your request. Please try again later.";
    }

    @RequestMapping("productsFallback")
    public String ProductsFallback() {
        return "Gateway fallback -> Products service seems to have a problem processing your request. Please try again later.";
    }

    @RequestMapping("restaurantFallback")
    public String RestaurantFallback() {
        return "Gateway fallback -> Restaurant service seems to have a problem processing your request. Please try again later.";
    }

    @RequestMapping("customerFallback")
    public String CustomerFallback() {
        return "Gateway fallback -> Customer service seems to have a problem processing your request. Please try again later.";
    }

    @RequestMapping("deliveryFallback")
    public String DeliveryFallback() {
        return "Gateway fallback -> Delivery service seems to have a problem processing your request. Please try again later.";
    }
}
