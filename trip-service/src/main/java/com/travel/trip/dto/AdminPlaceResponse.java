package com.travel.trip.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class AdminPlaceResponse {

    private UUID id;
    private UUID tenantId;
    private UUID destinationId;
    private String name;
    private String description;
    private String imageUrl;
    private BigDecimal timeRequired;
    private BigDecimal entryCost;
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public UUID getDestinationId() { return destinationId; }
    public void setDestinationId(UUID destinationId) { this.destinationId = destinationId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public BigDecimal getTimeRequired() { return timeRequired; }
    public void setTimeRequired(BigDecimal timeRequired) { this.timeRequired = timeRequired; }
    public BigDecimal getEntryCost() { return entryCost; }
    public void setEntryCost(BigDecimal entryCost) { this.entryCost = entryCost; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
