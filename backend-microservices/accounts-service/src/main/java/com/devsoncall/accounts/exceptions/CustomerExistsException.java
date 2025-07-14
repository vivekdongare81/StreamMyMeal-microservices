package com.devsoncall.accounts.exceptions;

public class CustomerExistsException extends RuntimeException {

  public CustomerExistsException(String message) {
    super(message);
  }
}
