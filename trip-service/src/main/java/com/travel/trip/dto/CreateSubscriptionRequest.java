package com.travel.trip.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class CreateSubscriptionRequest {
    @NotBlank
    private String priceId;

    private UUID tenantId;

    private String successUrl;
    private String cancelUrl;

    public String getPriceId() { return priceId; }
    public void setPriceId(String priceId) { this.priceId = priceId; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public String getSuccessUrl() { return successUrl; }
    public void setSuccessUrl(String successUrl) { this.successUrl = successUrl; }
    public String getCancelUrl() { return cancelUrl; }
    public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }
}
