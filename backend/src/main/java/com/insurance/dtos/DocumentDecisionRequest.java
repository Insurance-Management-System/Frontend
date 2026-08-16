package com.insurance.dtos;

import jakarta.validation.constraints.NotBlank;

public record DocumentDecisionRequest(@NotBlank String referenceType, @NotBlank String referenceId,
		@NotBlank String documentType, @NotBlank String status, String remarks) {
}
