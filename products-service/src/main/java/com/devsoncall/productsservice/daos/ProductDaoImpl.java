package com.devsoncall.productsservice.daos;

import com.devsoncall.productsservice.models.Product;
import com.devsoncall.productsservice.requests.FindProductRequest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Repository
public class ProductDaoImpl implements ProductDao {

    @Value("${redis.hashName.products}")
    private String HASH_KEY;

    @Autowired
    private SubCategoryDao subCategoryDao;

    @Autowired
    private RedisTemplate<String, Object> template;
    @Override
    public List<Product> GetAll() {
        var result = template.opsForHash().values(HASH_KEY);
        return (List<Product>)(Object)result;
    }
    @Override
    public Product FindProduct(FindProductRequest request) {
        var result = GetAll();

        try {
            if (request.getId() != 0) {
                var id = request.getId();

                var product = result.stream().filter(p -> p.getId() == id).findFirst().get();
                return product;
            } else if (request.getCategoryId() != 0) {
                return result.stream().filter(p -> p.getId() == request.getSubCategoryId()).findFirst().get();
            } else if (request.getSubCategoryId() != 0) {
                var subCategories = subCategoryDao.GetAll();

                var subCategorie = subCategories.stream().filter(sc -> sc.getCategoryId() == request.getCategoryId()).findFirst().get();

                return result.stream().filter(p -> p.getSubCategoryId() == subCategorie.getCategoryId()).findFirst().get();
            }
        }catch (Exception ex) {
            log.error("ProductDaoImpl -> FindProduct has an exception while finding element : "+ex.getMessage().toString());
        }
        return null;
    }
    @Override
    public Product Patch(Product product) {

        var request = new FindProductRequest();
        request.setId(product.getId());

        if(FindProduct(request) == null)
            return null;

        template.opsForHash().put(HASH_KEY, product.getId().toString(), product);

        return product;
    }
    @Override
    public Product Save(Product prod) {
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
        }
    }
}
