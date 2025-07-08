package com.devsoncall.restaurantsservice.Repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.devsoncall.restaurantsservice.models.Restaurant;

import java.util.Optional;

@Repository
public interface RestoRepository extends MongoRepository<Restaurant, Integer> {
}
