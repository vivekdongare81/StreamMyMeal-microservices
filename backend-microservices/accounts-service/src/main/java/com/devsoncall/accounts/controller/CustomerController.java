package com.devsoncall.accounts.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devsoncall.accounts.dto.CustomerDetailsDto;
import com.devsoncall.accounts.service.ICustomersService;

import jakarta.validation.constraints.Pattern;

@RestController
@RequestMapping( path = "/api", produces = {MediaType.APPLICATION_JSON_VALUE})
@Validated
public class CustomerController {

  private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);

  private final ICustomersService iCustomersService;

  public CustomerController(ICustomersService iCustomersService) {
    this.iCustomersService = iCustomersService;
  }

  @GetMapping("/fetchCustomerDetails")
  public ResponseEntity<CustomerDetailsDto> fetchCustomerDetails(@RequestHeader("devsoncall-correlation-id")
                                                                     String correlationId,
                                                                     @RequestParam("mobileNumber") @Pattern(regexp="(^$|[0-9]{10})",
                                                                          message = "Mobile number must be 10 digits")
                                                                 String mobileNumber) {
      logger.debug("fetchCustomerDetails method start");
      CustomerDetailsDto customerDetailsDto = iCustomersService.fetchCustomerDetails(mobileNumber, correlationId);
      logger.debug("fetchCustomerDetails method end");
      return ResponseEntity.status(HttpStatus.OK).body(customerDetailsDto);

  }

}
