package com.travel.trip.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class TenantDetailResponse {

    private UUID id;
    private String name;
    private String subdomain;
    private String domain;
    private String planType;
    private String status;
    private String adminEmail;
    private String logoUrl;
    private String primaryColor;
    private String accentColor;
    private String tagline;
    private LocalDateTime createdAt;
    private long tripCount;

    public TenantDetailResponse(UUID id, String name, String subdomain, String domain,
                                 String planType, String status, String adminEmail,
                                 String logoUrl, String primaryColor, String accentColor,
                                 String tagline, LocalDateTime createdAt, long tripCount) {
        this.id = id;
        this.name = name;
        this.subdomain = subdomain;
        this.domain = domain;
        this.planType = planType;
        this.status = status;
        this.adminEmail = adminEmail;
        this.logoUrl = logoUrl;
        this.primaryColor = primaryColor;
        this.accentColor = accentColor;
        this.tagline = tagline;
        this.createdAt = createdAt;
        this.tripCount = tripCount;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getSubdomain() { return subdomain; }
    public String getDomain() { return domain; }
    public String getPlanType() { return planType; }
    public String getStatus() { return status; }
    public String getAdminEmail() { return adminEmail; }
    public String getLogoUrl() { return logoUrl; }
    public String getPrimaryColor() { return primaryColor; }
    public String getAccentColor() { return accentColor; }
    public String getTagline() { return tagline; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public long getTripCount() { return tripCount; }
}
