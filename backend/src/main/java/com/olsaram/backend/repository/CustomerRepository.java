package com.olsaram.backend.repository;

import com.olsaram.backend.domain.customer.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByLoginId(String loginId);
    Optional<Customer> findByPhone(String phone);
    boolean existsByLoginId(String loginId);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
}
