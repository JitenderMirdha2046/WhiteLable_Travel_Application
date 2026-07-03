package com.travel.trip.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "trip_comparison")
public class TripComparison {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false, length = 100)
    private String destination;

    @Column(name = "comparison_type", nullable = false, length = 50)
    private String comparisonType;

    @Column(columnDefinition = "TEXT")
    private String itinerary;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getComparisonType() { return comparisonType; }
    public void setComparisonType(String comparisonType) { this.comparisonType = comparisonType; }
    public String getItinerary() { return itinerary; }
    public void setItinerary(String itinerary) { this.itinerary = itinerary; }
}
