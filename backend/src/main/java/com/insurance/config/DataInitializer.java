package com.insurance.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.insurance.entities.Customer;
import com.insurance.entities.DocumentCategory;
import com.insurance.entities.DocumentType;
import com.insurance.entities.KycStatus;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.DocumentTypeRepository;

/**
 * Seeds only the minimum needed for the app to be usable on a fresh database:
 * the two KYC document types (without at least one, no customer could ever complete
 * KYC verification) and a blank profile for the one demo customer whose login is
 * seeded in the Auth service. Everything else - categories, policies, purchases,
 * payments, claims, notifications - is created by real use of the application.
 */
@Configuration
public class DataInitializer {

	@Bean
	CommandLineRunner seedCoreData(DocumentTypeRepository documentTypes, CustomerRepository customers) {
		return args -> {
			ensureDocumentType(documentTypes, "Aadhaar Card", DocumentCategory.KYC);
			ensureDocumentType(documentTypes, "PAN Card", DocumentCategory.KYC);

			if (customers.count() == 0) {
				// userId 2 matches the "Vrushabh" customer account seeded by the Auth service.
				Customer customer = new Customer();
				customer.setUserId(2L);
				customer.setName("Vrushabh T");
				customer.setEmail("vrushabh@gmail.com");
				customer.setPhone("9898912121");
				customer.setKycStatus(KycStatus.NOT_STARTED);
				customers.save(customer);
			}
		};
	}

	private void ensureDocumentType(DocumentTypeRepository documentTypes, String name, DocumentCategory category) {
		boolean exists = documentTypes.findAll().stream()
				.anyMatch(t -> t.getName().equalsIgnoreCase(name) && t.getCategory() == category);
		if (exists) {
			return;
		}
		DocumentType type = new DocumentType();
		type.setName(name);
		type.setCategory(category);
		type.setActive(true);
		documentTypes.save(type);
	}
}
