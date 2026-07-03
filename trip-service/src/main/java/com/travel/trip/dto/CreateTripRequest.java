package com.travel.trip.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public class CreateTripRequest {

    @NotBlank(message = "Destination is required")
    @Size(max = 100)
    private String destination;

    @NotNull(message = "Budget is required")
    @DecimalMin(value = "1", message = "Budget must be greater than 0")
    private BigDecimal budget;

    @NotNull(message = "Days is required")
    @Min(value = 1, message = "At least 1 day required")
    @Max(value = 30, message = "Max 30 days")
    private Integer days;

    @NotBlank(message = "Travel type is required")
    private String travelType;

    private String moodDescription;

    private UUID tenantId;

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public Integer getDays() { return days; }
    public void setDays(Integer days) { this.days = days; }
    public String getTravelType() { return travelType; }
    public void setTravelType(String travelType) { this.travelType = travelType; }
    public String getMoodDescription() { return moodDescription; }
    public void setMoodDescription(String moodDescription) { this.moodDescription = moodDescription; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
}
