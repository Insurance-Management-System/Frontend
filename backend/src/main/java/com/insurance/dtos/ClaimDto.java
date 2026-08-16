package com.insurance.dtos;

public record ClaimDto(String id, String customerId, String policyId, Double amount, String reason, String status,
		String date, String referenceId) {
}
