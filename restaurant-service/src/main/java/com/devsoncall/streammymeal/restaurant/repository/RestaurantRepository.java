package com.devsoncall.streammymeal.restaurant.repository;

import com.devsoncall.streammymeal.restaurant.entity.Restaurant;
import com.devsoncall.streammymeal.restaurant.projection.RestaurantProjection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Integer> {
    @Query("SELECT DISTINCT r FROM Restaurant r LEFT JOIN r.menuItems m " +
            "WHERE (:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(r.address) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Restaurant> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
