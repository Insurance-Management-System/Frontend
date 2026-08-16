package com.insurance.dtos;

import jakarta.validation.constraints.NotBlank;

public record CategoryWriteRequest(String id, @NotBlank String name, String description) {
}
