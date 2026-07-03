package com.travel.user.dto;

import java.util.UUID;

public class AuthResponse {
    private String token;
    private UUID tenantId;

    public AuthResponse() {}

    public AuthResponse(String token, UUID tenantId) {
        this.token = token;
        this.tenantId = tenantId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
}
