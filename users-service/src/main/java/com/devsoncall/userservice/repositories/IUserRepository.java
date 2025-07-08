package com.devsoncall.userservice.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devsoncall.userservice.models.User;

@Repository
public interface IUserRepository extends JpaRepository<User, Integer> {


}
