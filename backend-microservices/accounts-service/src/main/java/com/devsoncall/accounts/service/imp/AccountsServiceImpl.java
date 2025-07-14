package com.devsoncall.accounts.service.imp;

import java.util.Optional;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;

import com.devsoncall.accounts.constants.AccountsConstants;
import com.devsoncall.accounts.dto.AccountsDto;
import com.devsoncall.accounts.dto.AccountsMsgDto;
import com.devsoncall.accounts.dto.CustomerDto;
import com.devsoncall.accounts.entity.Accounts;
import com.devsoncall.accounts.entity.Customer;
import com.devsoncall.accounts.exceptions.CustomerExistsException;
import com.devsoncall.accounts.exceptions.ResourceNotFoundException;
import com.devsoncall.accounts.mapper.AccountsMapper;
import com.devsoncall.accounts.mapper.CustomerMapper;
import com.devsoncall.accounts.repository.AccountsRepository;
import com.devsoncall.accounts.repository.CustomerRepository;
import com.devsoncall.accounts.service.IAccountsService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AccountsServiceImpl implements IAccountsService {

  private static final Logger log = LoggerFactory.getLogger(AccountsServiceImpl.class);
    
  private AccountsRepository accountsRepo;
  private CustomerRepository customerRepo;
  private final StreamBridge streamBridge; // any messaging broker bridge

  /** @param customerDto - CustomerDto Object */
  @Override
  public void createAccount(CustomerDto customerDto) {
    Customer customer = CustomerMapper.mapToCustomer(customerDto, new Customer());
    Optional<Customer> optionalCustomer =
        customerRepo.findByMobileNumber(customer.getMobileNumber());
    if (optionalCustomer.isPresent()) {
      throw new CustomerExistsException(
          "Customer account already exists with phone number "
              + customerDto.getMobileNumber()
              + ", please try with different number.");
    }
    Customer savedCustomer = customerRepo.save(customer);
    Accounts savedAccount = accountsRepo.save(createNewAccount(savedCustomer));
    
    sendCommunication(savedAccount, savedCustomer); // Async Messaging thru Broker

  }

  /**
   * @param customer - Customer Object
   * @return the new account details
   */
  private Accounts createNewAccount(Customer customer) {
    Accounts newAccount = new Accounts();
    newAccount.setCustomerId(customer.getCustomerId());
    long randomAccNumber = 1000000000L + new Random().nextInt(900000000);
    newAccount.setAccountNumber(randomAccNumber);
    newAccount.setAccountType(AccountsConstants.SAVINGS);
    newAccount.setBranchAddress(AccountsConstants.ADDRESS);
    return newAccount;
  }

  /**
   * @param mobileNumber - Input Mobile Number
   * @return Accounts Details based on a given mobileNumber
   */
  public CustomerDto fetchAccount(String mobileNumber) {
    Customer customer = customerRepo.findByMobileNumber(mobileNumber)
    		.orElseThrow(() -> new ResourceNotFoundException("Customer", "mobileNumber", mobileNumber)
    );
    Accounts accounts = accountsRepo.findByCustomerId(customer.getCustomerId())
    		.orElseThrow(()-> new ResourceNotFoundException("Accounts", "CustomerID", customer.getCustomerId().toString())
    );
    CustomerDto customerDto = CustomerMapper.mapToCustomerDto(customer, new CustomerDto());
    AccountsDto accountsDto = AccountsMapper.mapToAccountsDto(accounts, new AccountsDto());
    customerDto.setAccountsDto(accountsDto);
    return customerDto;
  }

  /**
   * @param customerDto - CustomerDto Object
   * @return boolean indicating if the update of Account details is successful or not
   */
  public boolean updateAccount(CustomerDto customerDto) {
	  boolean isUpdated = false;
	  AccountsDto accountsDto = customerDto.getAccountsDto();
	  if(accountsDto !=null ){ 
		  // find account
		  Accounts accounts = accountsRepo.findById(accountsDto.getAccountNumber())
				  .orElseThrow(()-> new ResourceNotFoundException("Accounts", "AccountNumber",accountsDto.getAccountNumber().toString())
		  );
		  AccountsMapper.mapToAccountsDto(accounts, accountsDto); // update account
		  accountsRepo.save(accounts);
		  // find customer
		  Customer customer = customerRepo.findByMobileNumber(customerDto.getMobileNumber())
				  .orElseThrow(()-> new ResourceNotFoundException("Customer", "MobileNumber",customerDto.getMobileNumber().toString())
		  );
		  CustomerMapper.mapToCustomerDto(customer, customerDto); // update customer
		  customerRepo.save(customer);
		  isUpdated = true;
	  }
    return isUpdated;
  }

  /**
   * @param mobileNumber - Input Mobile Number
   * @return boolean indicating if the delete of Account details is successful or not
   */
  public boolean deleteAccount(String mobileNumber) {
    Customer customer = customerRepo.findByMobileNumber(mobileNumber)
    		.orElseThrow(() -> new ResourceNotFoundException("Customer", "MobileNumber", mobileNumber)
    );
    customerRepo.deleteById(customer.getCustomerId());
    accountsRepo.deleteById(customer.getCustomerId());
    return true;
  }
  
  private void sendCommunication(Accounts account, Customer customer) {
      var accountsMsgDto = new AccountsMsgDto(account.getAccountNumber(), customer.getName(),
              customer.getEmail(), customer.getMobileNumber());
      log.info("Sending Communication request for the details: {}", accountsMsgDto);
      var result = streamBridge.send("sendCommunication-out-0", accountsMsgDto);
      log.info("Is the Communication request successfully triggered ? : {}", result);
  }
  

  /**
   * @param accountNumber - Long
   * @return boolean indicating if the update of communication status is successful or not
   */
  @Override
  public boolean updateCommunicationStatus(Long accountNumber) {
      boolean isUpdated = false;
      if(accountNumber !=null ){
          Accounts accounts = accountsRepo.findById(accountNumber).orElseThrow(
                  () -> new ResourceNotFoundException("Account", "AccountNumber", accountNumber.toString())
          );
          accounts.setCommunicationStatus(true);
          accountsRepo.save(accounts);
          isUpdated = true;
      }
      return  isUpdated;
  }

  
}
