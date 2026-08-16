package com.insurance.dtos;

public record DocumentRecord(String id, String referenceType, String referenceId, String documentType,
		String originalFileName, String verificationStatus, String remarks, String uploadedAt) {
}
