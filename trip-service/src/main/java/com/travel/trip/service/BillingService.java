package com.travel.trip.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.travel.trip.dto.CreateSubscriptionRequest;
import com.travel.trip.dto.PricingPlanResponse;
import com.travel.trip.dto.SubscriptionResponse;
import com.travel.trip.entity.Tenant;
import com.travel.trip.exception.ResourceNotFoundException;
import com.travel.trip.repository.TenantRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BillingService {

    private static final Logger log = LoggerFactory.getLogger(BillingService.class);

    private final TenantRepository tenantRepository;
    private final String stripeSecretKey;
    private final String stripeWebhookSecret;

    private boolean devMode = true;

    private static final Map<String, PricingPlanResponse> PLANS = new ConcurrentHashMap<>();

    public BillingService(TenantRepository tenantRepository,
                          @Value("${stripe.secret-key:}") String stripeSecretKey,
                          @Value("${stripe.webhook-secret:}") String stripeWebhookSecret) {
        this.tenantRepository = tenantRepository;
        this.stripeSecretKey = stripeSecretKey;
        this.stripeWebhookSecret = stripeWebhookSecret;
    }

    @PostConstruct
    public void init() {
        if (stripeSecretKey != null && !stripeSecretKey.isBlank()
                && !"sk_test_placeholder".equals(stripeSecretKey)) {
            Stripe.apiKey = stripeSecretKey;
            devMode = false;
            log.info("Stripe initialized in LIVE mode");
        } else {
            log.info("Stripe running in DEV mode (no API key)");
        }

        PLANS.put("starter", new PricingPlanResponse("Starter", 199, "/month",
                "Perfect for small agencies getting started with AI travel planning.",
                List.of("1 Agency Account", "3 Sub-Agents", "500 Trips/mo",
                        "Subdomain (.travelplanner.com)", "Basic Branding", "Email Support"),
                false, "price_starter"));

        PLANS.put("growth", new PricingPlanResponse("Growth", 499, "/month",
                "For growing agencies that need more power and flexibility.",
                List.of("1 Agency Account", "10 Sub-Agents", "2,000 Trips/mo",
                        "Custom Domain", "Full Branding", "Priority Support",
                        "Advanced Analytics", "Team Collaboration"),
                true, "price_growth"));

        PLANS.put("enterprise", new PricingPlanResponse("Enterprise", 0, "",
                "Custom solution for large agencies with specific needs.",
                List.of("Unlimited Accounts", "Custom Integrations",
                        "Dedicated Server", "SLA Guarantee", "On-Prem Option",
                        "24/7 Premium Support", "White-Label Mobile App"),
                false, "price_enterprise"));
    }

    public List<PricingPlanResponse> getPricingPlans() {
        return List.of(PLANS.get("starter"), PLANS.get("growth"), PLANS.get("enterprise"));
    }

    @Transactional
    public SubscriptionResponse createSubscription(CreateSubscriptionRequest request, UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        if (devMode) {
            return createDevSubscription(tenant, request);
        }

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomerEmail(tenant.getAdminEmail())
                    .setClientReferenceId(tenant.getId().toString())
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(request.getPriceId())
                            .setQuantity(1L)
                            .build())
                    .setSuccessUrl(request.getSuccessUrl() != null ? request.getSuccessUrl()
                            : "http://localhost:5173/admin/billing?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(request.getCancelUrl() != null ? request.getCancelUrl()
                            : "http://localhost:5173/admin/billing?canceled=true")
                    .putMetadata("tenantId", tenant.getId().toString())
                    .build();

            Session session = Session.create(params);

            tenant.setStripeCustomerId(session.getCustomer());
            tenant.setSubscriptionStatus("incomplete");
            tenantRepository.save(tenant);

            return new SubscriptionResponse(session.getId(), session.getUrl(), "incomplete");
        } catch (StripeException e) {
            log.error("Stripe subscription creation failed: {}", e.getMessage());
            throw new RuntimeException("Failed to create subscription: " + e.getMessage());
        }
    }

    private SubscriptionResponse createDevSubscription(Tenant tenant, CreateSubscriptionRequest request) {
        String planType = switch (request.getPriceId()) {
            case "price_growth" -> "growth";
            case "price_enterprise" -> "enterprise";
            default -> "starter";
        };

        tenant.setPlanType(planType);
        tenant.setSubscriptionStatus("active");
        tenant.setSubscriptionEndsAt(LocalDateTime.now().plusDays(30));
        tenant.setStatus("active");
        tenantRepository.save(tenant);

        return new SubscriptionResponse("dev_session_" + UUID.randomUUID(),
                "/admin/billing?dev_upgrade=" + planType, "active");
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        if (devMode) {
            log.info("DEV mode webhook received (ignoring): {}", payload);
            return;
        }

        try {
            com.stripe.net.Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
        } catch (Exception e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid webhook signature");
        }
    }

    @Transactional
    public void handleSubscriptionCompleted(String subscriptionId, String customerId, String tenantIdStr) {
        UUID tenantId = UUID.fromString(tenantIdStr);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        tenant.setSubscriptionId(subscriptionId);
        tenant.setStripeCustomerId(customerId);
        tenant.setSubscriptionStatus("active");
        tenant.setStatus("active");
        tenant.setPlanType("growth");
        tenant.setSubscriptionEndsAt(LocalDateTime.now().plusDays(30));
        tenantRepository.save(tenant);

        log.info("Tenant {} subscription activated: {}", tenantId, subscriptionId);
    }

    @Transactional
    public void handleSubscriptionCancelled(String subscriptionId, String tenantIdStr) {
        UUID tenantId = UUID.fromString(tenantIdStr);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        tenant.setSubscriptionStatus("cancelled");
        tenant.setStatus("trial");
        tenantRepository.save(tenant);

        log.info("Tenant {} subscription cancelled: {}", tenantId, subscriptionId);
    }
}
