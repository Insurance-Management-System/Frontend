package com.insurance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.insurance.entities.DocumentCategory;
import com.insurance.entities.DocumentType;

@Repository
public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {

	List<DocumentType> findByCategoryAndActiveTrue(DocumentCategory category);

	boolean existsByNameIgnoreCaseAndCategory(String name, DocumentCategory category);
}
