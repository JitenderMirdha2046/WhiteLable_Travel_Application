package com.travel.trip.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class AdminPlaceRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 200)
    private String name;

    private String description;

    @Size(max = 500)
    private String imageUrl;

    @NotNull(message = "Time required is required")
    @DecimalMin(value = "0.5", message = "Minimum 0.5 hours")
    @DecimalMax(value = "24", message = "Max 24 hours")
    private BigDecimal timeRequired;

    @DecimalMin(value = "0")
    private BigDecimal entryCost;

    private Boolean isActive;

    private Integer sortOrder;

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
}
