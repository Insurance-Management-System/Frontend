package com.insurance.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurance.custom_exception.InvalidRequestException;
import com.insurance.custom_exception.ResourceNotFoundException;
import com.insurance.dtos.DocumentTypeDto;
import com.insurance.dtos.DocumentTypeWriteRequest;
import com.insurance.entities.DocumentCategory;
import com.insurance.entities.DocumentType;
import com.insurance.entities.NotificationCategory;
import com.insurance.entities.NotificationPriority;
import com.insurance.repository.DocumentTypeRepository;
import com.insurance.util.IdFormat;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentTypeService {

	private final DocumentTypeRepository documentTypes;
	private final NotificationService notificationService;

	@Transactional(readOnly = true)
	public List<DocumentTypeDto> listAll() {
		return documentTypes.findAll().stream().map(this::toDto).toList();
	}

	@Transactional(readOnly = true)
	public List<DocumentTypeDto> listByCategory(String category) {
		if (category == null || category.isBlank()) {
			return listAll();
		}
		DocumentCategory parsed = DocumentCategory.valueOf(category.toUpperCase());
		return documentTypes.findByCategoryAndActiveTrue(parsed).stream().map(this::toDto).toList();
	}

	public DocumentTypeDto save(DocumentTypeWriteRequest request) {
		boolean isNew = request.id() == null || request.id().isBlank();
		DocumentType type = isNew
				? new DocumentType()
				: documentTypes.findById(IdFormat.parseNumericId(request.id()))
						.orElseThrow(() -> new ResourceNotFoundException("Document type not found: " + request.id()));
		DocumentCategory category = DocumentCategory.valueOf(request.category().toUpperCase());
		boolean nameOrCategoryChanged = type.getDocumentTypeId() == null
				|| type.getCategory() != category
				|| !type.getName().equalsIgnoreCase(request.name().trim());
		if (nameOrCategoryChanged && documentTypes.existsByNameIgnoreCaseAndCategory(request.name().trim(), category)) {
			throw new InvalidRequestException(
					"A " + category + " document type named '" + request.name().trim() + "' already exists.");
		}
		type.setName(request.name().trim());
		type.setCategory(category);
		if (type.getDocumentTypeId() == null) {
			type.setActive(true);
		}
		DocumentType saved = documentTypes.save(type);
		notificationService.notifyAdmin(isNew ? "Document type created" : "Document type updated",
				"You " + (isNew ? "created" : "updated") + " the document type \"" + saved.getName() + "\".",
				NotificationCategory.SYSTEM, NotificationPriority.LOW, String.valueOf(saved.getDocumentTypeId()));
		return toDto(saved);
	}

	public DocumentTypeDto setActive(String id, boolean active) {
		DocumentType type = documentTypes.findById(IdFormat.parseNumericId(id))
				.orElseThrow(() -> new ResourceNotFoundException("Document type not found: " + id));
		type.setActive(active);
		notificationService.notifyAdmin(active ? "Document type reactivated" : "Document type deactivated",
				"You " + (active ? "reactivated" : "deactivated") + " the document type \"" + type.getName() + "\".",
				NotificationCategory.SYSTEM, NotificationPriority.LOW, String.valueOf(type.getDocumentTypeId()));
		return toDto(type);
	}

	private DocumentTypeDto toDto(DocumentType t) {
		return new DocumentTypeDto(String.valueOf(t.getDocumentTypeId()), t.getName(), t.getCategory().name(), t.isActive());
	}
}
