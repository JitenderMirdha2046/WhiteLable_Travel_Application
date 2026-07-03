package com.travel.trip.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false, length = 100)
    private String destination;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal budget;

    @Column(nullable = false)
    private Integer days;

    @Column(name = "travel_type", nullable = false, length = 50)
    private String travelType;

    @Column(name = "mood_description", columnDefinition = "TEXT")
    private String moodDescription;

    @Column(name = "trip_status", length = 30)
    private String tripStatus;

    @Column(name = "weather_summary", columnDefinition = "TEXT")
    private String weatherSummary;

    @Column(name = "cache_used")
    private Boolean cacheUsed;

    @Column(name = "total_estimated_cost", precision = 10, scale = 2)
    private BigDecimal totalEstimatedCost;

    @Column(columnDefinition = "TEXT")
    private String itinerary;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
        if (tripStatus == null) tripStatus = "PENDING";
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
}
