package com.insurance.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurance.dtos.CategoryDto;
import com.insurance.dtos.ClaimDto;
import com.insurance.dtos.CustomerDto;
import com.insurance.dtos.DashboardResponse;
import com.insurance.dtos.DistributionDto;
import com.insurance.dtos.DocumentTypeDto;
import com.insurance.dtos.PaymentDto;
import com.insurance.dtos.PurchasedPolicyDto;
import com.insurance.dtos.RevenueDto;
import com.insurance.util.IdFormat;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

	private final CustomerService customerService;
	private final PolicyService policyService;
	private final CustomerPolicyService customerPolicyService;
	private final ClaimService claimService;
	private final PaymentRecordService paymentRecordService;
	private final NotificationService notificationService;
	private final CategoryService categoryService;
	private final DocumentTypeService documentTypeService;

	public DashboardResponse bootstrap(Long forCustomerUserId, boolean isAdmin) {
		Long scopedUserId = isAdmin ? null : forCustomerUserId;
		List<CustomerDto> customers = customerService.getVisibleCustomers(scopedUserId);
		List<com.insurance.dtos.PolicyDto> policies = policyService.getAllPolicies(scopedUserId);
		List<PurchasedPolicyDto> purchasedPolicies = customerPolicyService.getVisiblePurchases(scopedUserId);
		List<ClaimDto> claims = claimService.getVisibleClaims(forCustomerUserId, isAdmin);
		List<PaymentDto> payments = paymentRecordService.getVisiblePayments(scopedUserId);
		List<com.insurance.dtos.NotificationDto> notifications = notificationService.getVisibleNotifications(forCustomerUserId, isAdmin);
		List<CategoryDto> categories = categoryService.getAllCategories();
		List<DocumentTypeDto> documentTypes = isAdmin
				? documentTypeService.listAll()
				: documentTypeService.listByCategory("KYC");

		return new DashboardResponse(customers, policies, purchasedPolicies, claims, payments, notifications,
				categories, documentTypes, policyDistribution(purchasedPolicies), revenueByMonth(payments, claims));
	}

	private List<DistributionDto> policyDistribution(List<PurchasedPolicyDto> purchased) {
		Map<String, Long> counts = purchased.stream().collect(Collectors.groupingBy(
				p -> policyService.findEntityById(IdFormat.parseNumericId(p.policyId())).getCategory().getCategoryName(),
				Collectors.counting()));
		long total = Math.max(1, purchased.size());
		Map<String, String> fills = Map.of("Health", "#2f4b8f", "Life", "#3f87a6", "Vehicle", "#0f9d8c", "Travel",
				"#e0903c");
		return counts.entrySet().stream()
				.map(e -> new DistributionDto(e.getKey(), Math.round((e.getValue() * 100.0) / total),
						fills.getOrDefault(e.getKey(), "#2f4b8f")))
				.toList();
	}

	private List<RevenueDto> revenueByMonth(List<PaymentDto> paymentDtos, List<ClaimDto> claimDtos) {
		return List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec").stream()
				.map(month -> new RevenueDto(month,
						paymentDtos.stream().filter(p -> month.equals(monthName(p.date())) && "Paid".equals(p.status()))
								.mapToDouble(PaymentDto::amount).sum(),
						claimDtos.stream().filter(c -> month.equals(monthName(c.date()))).mapToDouble(ClaimDto::amount).sum()))
				.toList();
	}

	private String monthName(String date) {
		String name = java.time.Month.of(LocalDate.parse(date).getMonthValue()).name().substring(0, 3).toLowerCase();
		return Character.toUpperCase(name.charAt(0)) + name.substring(1);
	}
}
