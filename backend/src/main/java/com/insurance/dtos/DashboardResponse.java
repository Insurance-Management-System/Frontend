package com.insurance.dtos;

import java.util.List;

public record DashboardResponse(List<CustomerDto> customers, List<PolicyDto> policies,
		List<PurchasedPolicyDto> purchasedPolicies, List<ClaimDto> claims, List<PaymentDto> payments,
		List<NotificationDto> notifications, List<CategoryDto> categories, List<DocumentTypeDto> documentTypes,
		List<DistributionDto> policyDistribution, List<RevenueDto> revenueByMonth) {
}
