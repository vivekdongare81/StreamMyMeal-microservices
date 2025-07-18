package com.devsoncall.streammymeal.payment.controller;

import com.devsoncall.streammymeal.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public Map<String, String> createOrder(@RequestBody Map<String, Object> payload) {
        int amount = (int) payload.getOrDefault("amount", 100);
        String currency = (String) payload.getOrDefault("currency", "INR");
        String receipt = (String) payload.getOrDefault("receipt", "order_rcptid_11");
        String orderId = paymentService.createRazorpayOrder(amount, currency, receipt);
        return Map.of("orderId", orderId);
    }
} 