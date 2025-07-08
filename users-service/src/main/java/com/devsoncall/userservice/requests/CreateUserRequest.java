package com.devsoncall.userservice.requests;

public record CreateUserRequest(String full_name, String username, String password, String address) {
}
