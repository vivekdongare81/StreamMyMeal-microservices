package com.devsoncall.deliveryservice.Repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.devsoncall.deliveryservice.Models.Delivery;

public interface DeliveryRepository extends MongoRepository<Delivery, Integer> {
}
