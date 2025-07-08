package com.devsoncall.userservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class UserApplication {
    @Value("spring.datasource.url")
    private static String url;
    public static void main(String [] args){

        SpringApplication.run(UserApplication.class, args);

        System.out.printf(url);

    }

}
