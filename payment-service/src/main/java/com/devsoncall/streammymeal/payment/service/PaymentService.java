package com.devsoncall.streammymeal.payment.service;
 
public interface PaymentService {
    String createRazorpayOrder(int amount, String currency, String receipt);
} 