package com.devsoncall.streammymeal.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devsoncall.streammymeal.order.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Integer> {
}
