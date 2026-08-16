package com.insurance.dtos;

import java.util.List;

public record CustomerDocumentsDto(String customerId, String customerName, List<DocumentRecord> kyc,
		List<DocumentRecord> purchase, List<DocumentRecord> claim) {
}
