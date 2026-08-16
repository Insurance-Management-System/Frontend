package com.insurance.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.dtos.CustomerDocumentsDto;
import com.insurance.dtos.DocumentDecisionRequest;
import com.insurance.service.DocumentAggregationService;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DocumentAggregationController {

	private final DocumentAggregationService documentAggregationService;

	@GetMapping("/by-customer")
	public List<CustomerDocumentsDto> byCustomer() {
		return documentAggregationService.listByCustomer();
	}

	@PostMapping("/notify-decision")
	@Transactional
	public void notifyDecision(@Valid @RequestBody DocumentDecisionRequest request) {
		documentAggregationService.recordDecision(request);
	}
}
