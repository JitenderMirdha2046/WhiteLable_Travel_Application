package com.travel.trip.controller;

import com.travel.trip.dto.*;
import com.travel.trip.service.TripService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createTrip(
            @Valid @RequestBody CreateTripRequest request,
            @RequestHeader("X-User-Id") String userId) {
        TripResponse response = tripService.createTrip(request, UUID.fromString(userId));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("tripId", response.getId(), "status", response.getTripStatus()));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> getTripStatus(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        TripResponse trip = tripService.getTripById(id, UUID.fromString(userId));
        return ResponseEntity.ok(Map.of(
            "tripId", trip.getId(),
            "tripStatus", trip.getTripStatus(),
            "status", trip.getStatus()
        ));
    }

    @GetMapping("/all")
    public ResponseEntity<List<TripResponse>> getUserTrips(@RequestHeader("X-User-Id") String userId) {
        List<TripResponse> trips = tripService.getUserTrips(UUID.fromString(userId));
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/search")
    public ResponseEntity<List<TripResponse>> searchTrips(
            @RequestParam("keyword") String keyword,
            @RequestHeader("X-User-Id") String userId) {
        List<TripResponse> trips = tripService.searchTrips(UUID.fromString(userId), keyword);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        TripResponse trip = tripService.getTripById(id, UUID.fromString(userId));
        return ResponseEntity.ok(trip);
    }

    @GetMapping("/{id}/budget")
    public ResponseEntity<TripResponse.TripBudgetDto> getTripBudget(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        TripResponse.TripBudgetDto budget = tripService.getTripBudget(id, UUID.fromString(userId));
        return ResponseEntity.ok(budget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTrip(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        tripService.deleteTrip(id, UUID.fromString(userId));
        return ResponseEntity.ok(Map.of("message", "Trip deleted"));
    }

    @PostMapping("/replan")
    public ResponseEntity<Map<String, Object>> replanTrip(
            @Valid @RequestBody ReplanRequest request,
            @RequestHeader("X-User-Id") String userId) {
        TripResponse response = tripService.replanTrip(request, UUID.fromString(userId));
        return ResponseEntity.ok(Map.of("tripId", response.getId(), "tripStatus", response.getTripStatus()));
    }

    @PostMapping("/compare")
    public ResponseEntity<ComparisonResponse> compareTrips(
            @RequestBody Map<String, String> body,
            @RequestHeader("X-User-Id") String userId) {
        String destination = body.get("destination");
        if (destination == null || destination.isBlank()) {
            throw new IllegalArgumentException("Destination is required");
        }
        ComparisonResponse response = tripService.compareTrips(UUID.fromString(userId), destination);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cache-stats")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        Map<String, Object> stats = tripService.getCacheStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/destinations")
    public ResponseEntity<List<Map<String, Object>>> getPopularDestinations() {
        List<Map<String, Object>> popular = tripService.getPopularDestinations();
        return ResponseEntity.ok(popular);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAdminAnalytics() {
        Map<String, Object> analytics = tripService.getAdminAnalytics();
        return ResponseEntity.ok(analytics);
    }
}
