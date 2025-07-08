package com.devsoncall.userservice.controllers;

import com.devsoncall.userservice.models.User;
import com.devsoncall.userservice.requests.CreateUserRequest;
import com.devsoncall.userservice.requests.PatchUserRequest;
import com.devsoncall.userservice.services.UserService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("com/microservices/user")
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;
    @GetMapping
    public ResponseEntity<List<User>> GetAll(){
        var result = userService.GetUser();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/getById")
    public ResponseEntity<User> GetById(@RequestParam("id") Integer id){

        if(id == 0 || id == null)
            return new ResponseEntity ("You have to pass a valid id", HttpStatus.BAD_REQUEST);

        var result = userService.GetUserById(id);

        if(result==null)
            return new ResponseEntity<>(null, HttpStatusCode.valueOf(404));

        return new ResponseEntity<>(result, HttpStatusCode.valueOf(200));
    }

    @PostMapping
    public ResponseEntity<User> CreateCustomer(@RequestBody CreateUserRequest request){

        if(request == null)
            return new ResponseEntity ("You have to pass a valid request", HttpStatus.BAD_REQUEST);

        var result = userService.CreateUser(request);


        return new ResponseEntity<>(result, HttpStatusCode.valueOf(200));
    }

    @DeleteMapping
    public ResponseEntity<String> Delete(@RequestParam("id") Integer id){

        if(id == 0 || id == null)
            return new ResponseEntity ("You have to pass a valid id", HttpStatus.BAD_REQUEST);

        var result = userService.DeleteUser(id);

        if(result==0)
            return new ResponseEntity<>("User with given id was not found!", HttpStatusCode.valueOf(404));

        return new ResponseEntity<>("User was successfully deleted!", HttpStatusCode.valueOf(200));
    }

    @PatchMapping
    public ResponseEntity<String> PatchCustomer(@RequestBody PatchUserRequest request){

        if(request == null)
            return new ResponseEntity ("You have to pass a valid request", HttpStatus.BAD_REQUEST);

        var result = userService.UpdateUser(request);

        if(result==null)
            return new ResponseEntity<>("User with given id was not found!", HttpStatusCode.valueOf(404));

        return new ResponseEntity<>("User was successfully patched!", HttpStatusCode.valueOf(200));
    }
}
