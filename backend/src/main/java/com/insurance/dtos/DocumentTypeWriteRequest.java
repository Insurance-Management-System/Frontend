package com.insurance.dtos;

import jakarta.validation.constraints.NotBlank;

public record DocumentTypeWriteRequest(String id, @NotBlank String name, @NotBlank String category) {
}
