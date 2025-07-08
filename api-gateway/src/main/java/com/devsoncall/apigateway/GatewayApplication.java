package com.devsoncall.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args){
        SpringApplication.run(GatewayApplication.class, args);
    }

/*    @Bean
    public RouteLocator restoRouteLocator(RouteLocatorBuilder builder){
        return builder
                .routes()
                .route("customer", r-> r.path("/customer/**")
                        .filters(f->f.requestRateLimiter(c->c.setRateLimiter(new RedisRateLimiter(5,5))))
                        .uri("http://localhost:8080/"))


                .build();
    }*/
}
