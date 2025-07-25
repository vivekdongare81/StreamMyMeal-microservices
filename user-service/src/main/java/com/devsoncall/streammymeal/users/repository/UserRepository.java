package com.devsoncall.streammymeal.users.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devsoncall.streammymeal.users.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsernameAndIsActiveTrue(String username);
    Optional<User> findByEmailAndIsActiveTrue(String email);
    Optional<User> findByUsername(String username);
    User findByUserIdAndIsActiveTrue(Integer userId);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    void deleteByUserId(Integer userId);
    
    Page<User> findByIsActiveTrue(Pageable pageable);

    boolean existsByEmailAndIsActiveTrue(String email);
    boolean existsByUsernameAndIsActiveTrue(String username);
}
