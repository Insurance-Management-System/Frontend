package com.insurance.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurance.client.DocumentServiceClient;
import com.insurance.dtos.CustomerDocumentsDto;
import com.insurance.dtos.DocumentDecisionRequest;
import com.insurance.dtos.DocumentRecord;
import com.insurance.entities.Claim;
import com.insurance.entities.Customer;
import com.insurance.entities.KycStatus;
import com.insurance.entities.NotificationCategory;
import com.insurance.entities.NotificationPriority;
import com.insurance.repository.ClaimRepository;
import com.insurance.repository.CustomerRepository;
import com.insurance.util.IdFormat;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentAggregationService {

	private final DocumentServiceClient documentServiceClient;
	private final CustomerRepository customers;
	private final ClaimRepository claims;
	private final CustomerService customerService;
	private final DocumentTypeService documentTypeService;
	private final NotificationService notificationService;

	@Transactional(readOnly = true)
	public List<CustomerDocumentsDto> listByCustomer() {
		Map<Long, List<DocumentRecord>> byCustomer = new LinkedHashMap<>();
		for (DocumentRecord doc : documentServiceClient.listAll()) {
			Long userId = resolveCustomerUserId(doc);
			if (userId == null) {
				continue;
			}
			byCustomer.computeIfAbsent(userId, k -> new ArrayList<>()).add(doc);
		}

		List<CustomerDocumentsDto> result = new ArrayList<>();
		for (Map.Entry<Long, List<DocumentRecord>> entry : byCustomer.entrySet()) {
			Customer customer = customers.findByUserId(entry.getKey()).orElse(null);
			if (customer == null) {
				continue;
			}
			List<DocumentRecord> kyc = entry.getValue().stream().filter(d -> "KYC".equals(d.referenceType())).toList();
			List<DocumentRecord> purchase = entry.getValue().stream()
					.filter(d -> "POLICY_PURCHASE".equals(d.referenceType())).toList();
			List<DocumentRecord> claimDocs = entry.getValue().stream().filter(d -> "CLAIM".equals(d.referenceType())).toList();
			result.add(new CustomerDocumentsDto(String.valueOf(customer.getUserId()), customer.getName(), kyc, purchase,
					claimDocs));
		}
		return result;
	}

	public void recordDecision(DocumentDecisionRequest request) {
		Long userId = resolveCustomerUserId(request.referenceType(), request.referenceId());
		if (userId == null) {
			return;
		}
		Customer customer = customers.findByUserId(userId).orElse(null);
		String customerName = customer == null ? "Customer #" + userId : customer.getName();
		boolean verified = "VERIFIED".equalsIgnoreCase(request.status());
		String docLabel = request.documentType();

		if ("KYC".equals(request.referenceType())) {
			if (verified) {
				List<String> verifiedNames = documentServiceClient.verifiedDocumentTypeNames("KYC", request.referenceId());
				List<String> requiredNames = documentTypeService.listByCategory("KYC").stream()
						.map(dto -> dto.name().toLowerCase()).toList();
				boolean allVerified = requiredNames.stream().allMatch(verifiedNames::contains);
				if (allVerified) {
					customerService.updateKycStatus(userId, KycStatus.VERIFIED);
					notificationService.notifyCustomer(userId, "KYC approved",
							"Congratulations. Your KYC has been approved. You can now purchase insurance policies.",
							NotificationCategory.KYC, NotificationPriority.HIGH, null);
					notificationService.notifyAdmin("KYC approved",
							"You approved " + customerName + "'s KYC verification.", NotificationCategory.KYC,
							NotificationPriority.LOW, String.valueOf(userId));
				}
			} else {
				customerService.updateKycStatus(userId, KycStatus.REJECTED);
				notificationService.notifyCustomer(userId, "KYC rejected",
						"Your KYC verification was rejected. " + docLabel + " was not accepted"
								+ (request.remarks() != null && !request.remarks().isBlank() ? ": " + request.remarks()
										: ".")
								+ " Please update and resubmit it.",
						NotificationCategory.KYC, NotificationPriority.HIGH, null);
				notificationService.notifyAdmin("KYC rejected",
						"You rejected " + customerName + "'s KYC document (" + docLabel + ").", NotificationCategory.KYC,
						NotificationPriority.LOW, String.valueOf(userId));
			}
			return;
		}

		notificationService.notifyCustomer(userId, verified ? "Document verified" : "Document rejected",
				docLabel + (verified ? " has been verified." : " was rejected"
						+ (request.remarks() != null && !request.remarks().isBlank() ? ": " + request.remarks() : ".")),
				NotificationCategory.DOCUMENT, NotificationPriority.MEDIUM, null);
		notificationService.notifyAdmin(verified ? "Document verified" : "Document rejected",
				"You " + (verified ? "verified" : "rejected") + " " + customerName + "'s " + docLabel + ".",
				NotificationCategory.DOCUMENT, NotificationPriority.LOW, String.valueOf(userId));
	}

	private Long resolveCustomerUserId(DocumentRecord doc) {
		return resolveCustomerUserId(doc.referenceType(), doc.referenceId());
	}

	private Long resolveCustomerUserId(String referenceType, String referenceId) {
		try {
			return switch (referenceType) {
				case "KYC" -> IdFormat.parseNumericId(referenceId);
				case "POLICY_PURCHASE" -> IdFormat.parseNumericId(referenceId.split(":")[0]);
				case "CLAIM" -> {
					Long claimId = IdFormat.parseNumericId(referenceId.split(":")[1]);
					Claim claim = claims.findById(claimId).orElse(null);
					yield claim == null ? null : claim.getCustomerPolicy().getCustomer().getUserId();
				}
				default -> null;
			};
		} catch (RuntimeException ex) {
			return null;
		}
	}
}
