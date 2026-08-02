package com.travel.trip.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class AdminDestinationRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    private String description;

    @Size(max = 500)
    private String imageUrl;

    @NotNull(message = "Estimated cost is required")
    @DecimalMin(value = "0", message = "Cost must be 0 or more")
    private BigDecimal estimatedCost;

    private List<String> travelTypes;

    private Boolean isActive;

    private Integer sortOrder;

    @Min(value = 0, message = "Start hour must be 0-23")
    @Max(value = 23, message = "Start hour must be 0-23")
    private Integer activeStartHour;

    @Min(value = 0, message = "End hour must be 0-23")
    @Max(value = 23, message = "End hour must be 0-23")
    private Integer activeEndHour;

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
}
