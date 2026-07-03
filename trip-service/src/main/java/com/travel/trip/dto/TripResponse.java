package com.travel.trip.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class TripResponse {
    private UUID id;
    private UUID userId;
    private UUID tenantId;
    private String destination;
    private BigDecimal budget;
    private Integer days;
    private String travelType;
    private String moodDescription;
    private String tripStatus;
    private String weatherSummary;
    private Boolean cacheUsed;
    private BigDecimal totalEstimatedCost;
    private String itinerary;
    private String status;
    private LocalDateTime createdAt;
    private TripBudgetDto budgetBreakdown;

    public static class TripBudgetDto {
        private BigDecimal hotelCost;
        private BigDecimal foodCost;
        private BigDecimal transportCost;
        private BigDecimal activityCost;
        private BigDecimal miscCost;

        public BigDecimal getHotelCost() { return hotelCost; }
        public void setHotelCost(BigDecimal hotelCost) { this.hotelCost = hotelCost; }
        public BigDecimal getFoodCost() { return foodCost; }
        public void setFoodCost(BigDecimal foodCost) { this.foodCost = foodCost; }
        public BigDecimal getTransportCost() { return transportCost; }
        public void setTransportCost(BigDecimal transportCost) { this.transportCost = transportCost; }
        public BigDecimal getActivityCost() { return activityCost; }
        public void setActivityCost(BigDecimal activityCost) { this.activityCost = activityCost; }
        public BigDecimal getMiscCost() { return miscCost; }
        public void setMiscCost(BigDecimal miscCost) { this.miscCost = miscCost; }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
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
    public String getTripStatus() { return tripStatus; }
    public void setTripStatus(String tripStatus) { this.tripStatus = tripStatus; }
    public String getWeatherSummary() { return weatherSummary; }
    public void setWeatherSummary(String weatherSummary) { this.weatherSummary = weatherSummary; }
    public Boolean getCacheUsed() { return cacheUsed; }
    public void setCacheUsed(Boolean cacheUsed) { this.cacheUsed = cacheUsed; }
    public BigDecimal getTotalEstimatedCost() { return totalEstimatedCost; }
    public void setTotalEstimatedCost(BigDecimal totalEstimatedCost) { this.totalEstimatedCost = totalEstimatedCost; }
    public String getItinerary() { return itinerary; }
    public void setItinerary(String itinerary) { this.itinerary = itinerary; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public TripBudgetDto getBudgetBreakdown() { return budgetBreakdown; }
    public void setBudgetBreakdown(TripBudgetDto budgetBreakdown) { this.budgetBreakdown = budgetBreakdown; }
}
