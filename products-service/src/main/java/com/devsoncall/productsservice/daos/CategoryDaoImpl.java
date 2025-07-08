package com.devsoncall.productsservice.daos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import com.devsoncall.productsservice.models.Category;

import java.util.List;

@Repository
public class CategoryDaoImpl implements CategoryDao{

    @Value("${redis.hashName.categories}")
    private String HASH_KEY;
    @Autowired
    private RedisTemplate<String, Object> template;
    @Override
    public List<Category> GetAll() {
        var result = template.opsForHash().values(HASH_KEY);
        return (List<Category>)(Object)result;
    }
    @Override
    public Category GetById(Integer id) {
        return (Category)template.opsForHash().get(HASH_KEY, id.toString());
    }

    @Override
    public Category Patch(Category category) {

        if(GetById(category.getId()) == null)
            return null;

        template.opsForHash().put(HASH_KEY, category.getId().toString(), category);

        return category;
    }
    @Override
    public Category Save(Category category) {
        template.opsForHash().put(HASH_KEY, category.getId().toString(), category);

        return category;
    }

    @Override
    public int Delete(Integer id) {
        try {
            Long result = template.opsForHash().delete(HASH_KEY, id.toString());
            return 1;
        }catch (Exception ex) {
            return 0;
        }
    }
}
