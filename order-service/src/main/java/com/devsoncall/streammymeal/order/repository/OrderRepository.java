package com.devsoncall.streammymeal.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devsoncall.streammymeal.order.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    Page<Order> findByUserId(Integer userId, Pageable pageable);
    Page<Order> findByUserIdOrderByOrderDateDesc(Integer userId, Pageable pageable);
}
