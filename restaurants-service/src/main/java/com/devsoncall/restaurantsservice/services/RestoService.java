package com.devsoncall.restaurantsservice.services;

import com.devsoncall.restaurantsservice.Repositories.RestoRepository;
import com.devsoncall.restaurantsservice.models.Restaurant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestoService {

    @Autowired
    private RestoRepository repository;

    public List<Restaurant> GetAll(){
        var list = repository.findAll();

        return list;
    }

    public Restaurant InsertOne(Restaurant restaurant){
       var result = repository.insert(restaurant);

        return result;
    }

    public Restaurant PatchOne(Restaurant restaurant){

        var result = repository.save(restaurant);

        return result;
    }

    public Restaurant FindOneById(Integer id){

        var result = repository.findById(id);

        return result.get();
    }

    public int DeleteOne(Integer id){

        if(FindOneById(id)==null)
            return 0;

        repository.deleteById(id);
        repository.deleteById(id);

        return 1;
    }
}
