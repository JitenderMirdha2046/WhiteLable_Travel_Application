package com.travel.trip.controller;

import com.travel.trip.dto.CreateSubscriptionRequest;
import com.travel.trip.dto.PricingPlanResponse;
import com.travel.trip.dto.SubscriptionResponse;
import com.travel.trip.service.BillingService;
import com.travel.trip.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class BillingController {

    private final BillingService billingService;
    private final TenantService tenantService;

    public BillingController(BillingService billingService, TenantService tenantService) {
        this.billingService = billingService;
        this.tenantService = tenantService;
    }

    @GetMapping("/api/tenants/pricing")
    public ResponseEntity<List<PricingPlanResponse>> getPricingPlans() {
        return ResponseEntity.ok(billingService.getPricingPlans());
    }

    @PostMapping("/api/billing/create-subscription")
    public ResponseEntity<SubscriptionResponse> createSubscription(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestHeader("X-Admin-Token") String adminToken,
            @Valid @RequestBody CreateSubscriptionRequest request) {
        tenantService.validateAdminToken(tenantId, adminToken);
        request.setTenantId(tenantId);
        return ResponseEntity.ok(billingService.createSubscription(request, tenantId));
    }

    @PostMapping("/api/billing/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        billingService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("OK");
    }
}
