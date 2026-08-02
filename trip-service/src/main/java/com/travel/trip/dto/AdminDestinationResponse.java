package com.travel.trip.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class AdminDestinationResponse {

    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private String imageUrl;
    private BigDecimal estimatedCost;
    private List<String> travelTypes;
    private Boolean isActive;
    private Integer sortOrder;
    private Integer activeStartHour;
    private Integer activeEndHour;
    private LocalDateTime createdAt;
    private List<AdminPlaceResponse> places;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
    public List<String> getTravelTypes() { return travelTypes; }
    public void setTravelTypes(List<String> travelTypes) { this.travelTypes = travelTypes; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Integer getActiveStartHour() { return activeStartHour; }
    public void setActiveStartHour(Integer activeStartHour) { this.activeStartHour = activeStartHour; }
    public Integer getActiveEndHour() { return activeEndHour; }
    public void setActiveEndHour(Integer activeEndHour) { this.activeEndHour = activeEndHour; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<AdminPlaceResponse> getPlaces() { return places; }
    public void setPlaces(List<AdminPlaceResponse> places) { this.places = places; }
}
