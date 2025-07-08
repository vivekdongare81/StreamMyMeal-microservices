package com.devsoncall.userservice.requests;

public record PatchUserRequest(Integer id, String full_name, String username, String address){
}
