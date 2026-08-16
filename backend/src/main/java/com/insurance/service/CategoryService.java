package com.insurance.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurance.custom_exception.ResourceNotFoundException;
import com.insurance.dtos.CategoryDto;
import com.insurance.dtos.CategoryWriteRequest;
import com.insurance.entities.Category;
import com.insurance.entities.CategoryStatus;
import com.insurance.entities.NotificationCategory;
import com.insurance.entities.NotificationPriority;
import com.insurance.repository.CategoryRepository;
import com.insurance.util.IdFormat;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

	private final CategoryRepository categories;
	private final NotificationService notificationService;

	@Transactional(readOnly = true)
	public List<CategoryDto> getAllCategories() {
		return categories.findAll().stream().map(this::toDto).toList();
	}

	public CategoryDto saveCategory(CategoryWriteRequest request) {
		boolean isNew = request.id() == null || request.id().isBlank();
		Category category = isNew
				? new Category()
				: categories.findById(IdFormat.parseNumericId(request.id()))
						.orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.id()));
		category.setCategoryName(request.name());
		category.setDescription(request.description());
		category.setStatus(CategoryStatus.ACTIVE);
		Category saved = categories.save(category);
		notificationService.notifyAdmin(isNew ? "Category created" : "Category updated",
				"You " + (isNew ? "created" : "updated") + " the category \"" + saved.getCategoryName() + "\".",
				NotificationCategory.SYSTEM, NotificationPriority.LOW, "cat" + saved.getCategoryId());
		return toDto(saved);
	}

	public void deleteCategory(String id) {
		Category category = categories.findById(IdFormat.parseNumericId(id))
				.orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
		categories.delete(category);
	}

	private CategoryDto toDto(Category c) {
		return new CategoryDto("cat" + c.getCategoryId(), c.getCategoryName(), c.getDescription());
	}
}
