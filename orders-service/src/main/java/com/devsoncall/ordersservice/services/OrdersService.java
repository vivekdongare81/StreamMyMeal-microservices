package com.devsoncall.ordersservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.devsoncall.ordersservice.models.ProductOrder;

import java.util.List;

@Service
public class OrdersService {
    @Autowired
    private JdbcTemplate template;
    
    public List<ProductOrder> GetAll(){
        String sql = "SELECT * FROM productorder";

        var result = template.query(sql, BeanPropertyRowMapper.newInstance(ProductOrder.class));

        return result;
    }

    public int InsertOne(ProductOrder order){
        String sql = """
                INSERT INTO productorder(date, total_order_price) VALUES (?,?)
                """;

        var result = template.update(sql, order.getDate(), order.getTotal_order_price());



        return result;
    }
}
