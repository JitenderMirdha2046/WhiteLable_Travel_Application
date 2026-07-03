package com.travel.trip.dto;

import java.util.UUID;

public class TenantAuthResponse {

    private UUID tenantId;
    private String agencyName;
    private String token;
    private String subdomain;
    private String planType;
    private String status;

    public TenantAuthResponse(UUID tenantId, String agencyName, String token,
                              String subdomain, String planType, String status) {
        this.tenantId = tenantId;
        this.agencyName = agencyName;
        this.token = token;
        this.subdomain = subdomain;
        this.planType = planType;
        this.status = status;
    }

    public UUID getTenantId() { return tenantId; }
    public String getAgencyName() { return agencyName; }
    public String getToken() { return token; }
    public String getSubdomain() { return subdomain; }
    public String getPlanType() { return planType; }
    public String getStatus() { return status; }
}
