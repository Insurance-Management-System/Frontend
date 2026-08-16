package com.insurance.dtos;

import jakarta.validation.constraints.NotBlank;

public record ClaimDraftRequest(@NotBlank String customerId, @NotBlank String policyId) {
}
