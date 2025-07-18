package com.devsoncall.streammymeal.payment.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;

@Service
public class PaymentServiceImpl implements PaymentService {
    private RazorpayClient razorpayClient;

    @Value("${razorpay.keyId}")
    private String keyId;

    @Value("${razorpay.keySecret}")
    private String keySecret;

    @PostConstruct
    public void init() throws Exception {
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    @Override
    public String createRazorpayOrder(int amount, String currency, String receipt) {
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount); // Razorpay expects amount in paise
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);
            orderRequest.put("payment_capture", 1);
            Order order = razorpayClient.orders.create(orderRequest);
            return order.get("id");
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay order", e);
        }
    }
} 