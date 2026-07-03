package com.travel.trip.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class TripEvent {
    private UUID tripId;
    private UUID userId;
    private String destination;
    private LocalDateTime createdAt;

    public TripEvent() {}

    public TripEvent(UUID tripId, UUID userId, String destination, LocalDateTime createdAt) {
        this.tripId = tripId;
        this.userId = userId;
        this.destination = destination;
        this.createdAt = createdAt;
    }

    public UUID getTripId() { return tripId; }
    public void setTripId(UUID tripId) { this.tripId = tripId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
