package com.travel.user.config;

public class JwtAuthDetails {

    private final String userId;
    private final String tenantId;

    public JwtAuthDetails(String userId, String tenantId) {
        this.userId = userId;
        this.tenantId = tenantId;
    }

    public String getUserId() { return userId; }
    public String getTenantId() { return tenantId; }
}
