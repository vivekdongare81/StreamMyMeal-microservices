package com.devsoncall.streammymeal.restaurant.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devsoncall.streammymeal.restaurant.entity.MenuItem;
import com.devsoncall.streammymeal.restaurant.entity.Restaurant;

import java.util.List;


public interface MenuItemRepository extends JpaRepository<MenuItem , Integer> {
    List<MenuItem> findByRestaurant(Restaurant restaurant);
}
