package com.devsoncall.productsservice.daos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import com.devsoncall.productsservice.models.Product;
import com.devsoncall.productsservice.models.SubCategory;

import java.util.List;

@Repository
public class SubCategoryDaoImpl implements SubCategoryDao{

    @Value("${redis.hashName.subcategories}")
    private String HASH_KEY;
    @Autowired
    private RedisTemplate<String, Object> template;
    @Override
    public List<SubCategory> GetAll() {
        var result = template.opsForHash().values(HASH_KEY);
        return (List<SubCategory>)(Object)result;
    }

    @Override
    public SubCategory GetById(Integer id) {
        return (SubCategory)template.opsForHash().get(HASH_KEY, id.toString());
    }

    @Override
    public SubCategory Patch(SubCategory product) {
        if(GetById(product.getId()) == null)
            return null;

        template.opsForHash().put(HASH_KEY, product.getId().toString(), product);

        return product;
    }

    @Override
    public SubCategory Save(SubCategory prod) {
        template.opsForHash().put(HASH_KEY, prod.getId().toString(), prod);

        return prod;
    }

    @Override
    public int Delete(Integer id) {
        try {
            Long result = template.opsForHash().delete(HASH_KEY, id.toString());
            return 1;
        }catch (Exception ex) {
            return 0;
        }    }
}
