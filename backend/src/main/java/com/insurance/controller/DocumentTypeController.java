package com.insurance.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.dtos.DocumentTypeDto;
import com.insurance.dtos.DocumentTypeWriteRequest;
import com.insurance.service.DocumentTypeService;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/document-types")
@RequiredArgsConstructor
public class DocumentTypeController {

	private final DocumentTypeService documentTypeService;

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public List<DocumentTypeDto> list(@RequestParam(required = false) String category) {
		return documentTypeService.listByCategory(category);
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	@Transactional
	public DocumentTypeDto save(@Valid @RequestBody DocumentTypeWriteRequest request) {
		return documentTypeService.save(request);
	}

	@PatchMapping("/{id}/active")
	@PreAuthorize("hasRole('ADMIN')")
	@Transactional
	public DocumentTypeDto setActive(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
		return documentTypeService.setActive(id, Boolean.TRUE.equals(body.get("active")));
	}
}
