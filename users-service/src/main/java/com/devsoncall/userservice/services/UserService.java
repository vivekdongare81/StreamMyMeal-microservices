package com.devsoncall.userservice.services;

import com.devsoncall.userservice.models.Role;
import com.devsoncall.userservice.models.User;
import com.devsoncall.userservice.repositories.IUserRepository;
import com.devsoncall.userservice.requests.CreateUserRequest;
import com.devsoncall.userservice.requests.PatchUserRequest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserService {

  @Autowired private IUserRepository repository;

  public List<User> GetUser() {
    var result = repository.findAll();

    return result;
  }

  public User GetUserById(Integer id) {

    try {
      var result = repository.findById(id);

      return result.get();

    } catch (Exception ex) {
      return null;
    }
  }

  public int DeleteUser(Integer id) {

    if (GetUserById(id) == null) return 0;

    repository.deleteById(id);

    return 1;
  }

  public User UpdateUser(PatchUserRequest request) {

    try {
      var customer = repository.findById(request.id());

      if (!request.username().isBlank() && !request.username().isEmpty())
        customer.get().setUsername(request.username());
      if (!request.address().isBlank() && !request.address().isEmpty())
        customer.get().setAddress(request.address());
      if (!request.full_name().isBlank() && !request.full_name().isEmpty())
        customer.get().setFull_name(request.full_name());

      var result = repository.save(customer.get());

      return result;

    } catch (Exception ex) {
      return null;
    }
  }

  public User CreateUser(CreateUserRequest request) {

    User product =
        User.builder()
            .password(request.password())
            .full_name(request.full_name())
            .username(request.username())
            .address(request.address())
            .role(Role.CUSTOMER)
            .id(0)
            .build();

    var result = repository.save(product);

    return result;
  }

  public User FindByUsername(String username) {

    var result =
        repository
            .findAll()
            .stream()
            .filter(u -> u.getUsername() == username)
            .collect(Collectors.toList());

    if (result.isEmpty()) return null;

    return result.stream().findFirst().get();
  }
}
