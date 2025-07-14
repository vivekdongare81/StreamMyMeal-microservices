package com.devsoncall.gatewayserver.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

	@Value("${auth.enabled:true}")
	private boolean authEnabled;
	
	@Bean
	public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity serverHttpSecurity) {
	    if (!authEnabled) {
	    	//Disable all auth when auth.enabled=false
	    	serverHttpSecurity.authorizeExchange().anyExchange().permitAll(); // Skip all security
	    } else {
	    	serverHttpSecurity.authorizeExchange(exchanges -> exchanges
	                .pathMatchers(HttpMethod.GET).permitAll()
	                .pathMatchers("/devsoncall/accounts/**").hasRole("ACCOUNTS")
	                .pathMatchers("/devsoncall/cards/**").hasRole("CARDS")
	                .pathMatchers("/devsoncall/loans/**").hasRole("LOANS"))
	            .oauth2ResourceServer(oauth2 -> oauth2
	                .jwt(jwt -> jwt.jwtAuthenticationConverter(grantedAuthoritiesExtractor())));
	    }
	   // Always disable CSRF for API Gateway
	    serverHttpSecurity.csrf(ServerHttpSecurity.CsrfSpec::disable); 
	    //serverHttpSecurity.csrf(csrfSpec -> csrfSpec.disable()); //CSRF
	    
	    return serverHttpSecurity.build();
	}

    private Converter<Jwt, Mono<AbstractAuthenticationToken>> grantedAuthoritiesExtractor() {
        JwtAuthenticationConverter jwtAuthenticationConverter =
                new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter
                (new KeycloakRoleConverter());
        return new ReactiveJwtAuthenticationConverterAdapter(jwtAuthenticationConverter);
    }

}
