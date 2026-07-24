package com.travel.user.dto;

import java.util.UUID;

public class ProfileResponse {
    private UUID id;
    private String name;
    private String email;
    private String avatarUrl;
    private UUID tenantId;

    public ProfileResponse(UUID id, String name, String email, String avatarUrl, UUID tenantId) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.tenantId = tenantId;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getAvatarUrl() { return avatarUrl; }
    public UUID getTenantId() { return tenantId; }
}
