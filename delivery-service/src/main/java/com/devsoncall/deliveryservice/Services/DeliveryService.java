package com.devsoncall.deliveryservice.Services;

import com.devsoncall.deliveryservice.Models.Delivery;
import com.devsoncall.deliveryservice.Repositories.DeliveryRepository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class DeliveryService {

    @Autowired
    private DeliveryRepository repository;

    public List<Delivery> GetDeliveries(){
        var result = repository.findAll();

        return result;
    }

    public Delivery GetDeliveryById(Integer id){
        var result = repository.findById(id);
        try {
            return result.get();
        }catch(Exception ex){
            log.warn("Delivery by the given id: {} was not found", id);
            return null;
        }
    }

    public Integer DeleteDelivery(Integer id){

        var delivery = GetDeliveryById(id);

        if(delivery == null)
            return 0;

        repository.delete(delivery);

        return 1;
    }

    public Delivery PatchDelivery(Delivery delivery){
        var entity = GetDeliveryById(delivery.getId());

        if(repository.existsById(delivery.getId()))
            return null;

        var result = repository.save(entity);

        return result;
    }

    public Delivery InsertOneDelivery(Delivery delivery){
        var result = repository.save(delivery);

        return result;
    }
}
