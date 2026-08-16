package com.insurance.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.dtos.DashboardResponse;
import com.insurance.security.CurrentUserAccessor;
import com.insurance.security.JwtAuthenticationFilter.AuthenticatedUser;
import com.insurance.service.DashboardService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

	private final DashboardService dashboardService;
	private final CurrentUserAccessor currentUserAccessor;

	@GetMapping("/bootstrap")
	@Transactional
	public DashboardResponse bootstrap(Authentication authentication) {
		AuthenticatedUser user = currentUserAccessor.currentUser(authentication);
		boolean admin = currentUserAccessor.isAdmin(user);
		return dashboardService.bootstrap(user.userId(), admin);
	}
}
