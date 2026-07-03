package com.travel.trip.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "trip_budget")
public class TripBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "trip_id", nullable = false)
    private UUID tripId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "hotel_cost", precision = 10, scale = 2)
    private BigDecimal hotelCost;

    @Column(name = "food_cost", precision = 10, scale = 2)
    private BigDecimal foodCost;

    @Column(name = "transport_cost", precision = 10, scale = 2)
    private BigDecimal transportCost;

    @Column(name = "activity_cost", precision = 10, scale = 2)
    private BigDecimal activityCost;

    @Column(name = "misc_cost", precision = 10, scale = 2)
    private BigDecimal miscCost;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTripId() { return tripId; }
    public void setTripId(UUID tripId) { this.tripId = tripId; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
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
