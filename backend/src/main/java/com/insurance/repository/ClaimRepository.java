package com.insurance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.insurance.entities.Claim;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
	List<Claim> findByCustomerPolicy_Customer_UserId(Long userId);
}
