package com.travel.trip.controller;

import com.travel.trip.dto.AdminPlaceRequest;
import com.travel.trip.dto.AdminPlaceResponse;
import com.travel.trip.service.AdminPlaceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenants/destinations/{destinationId}/places")
public class AdminPlaceController {

    private final AdminPlaceService service;

    public AdminPlaceController(AdminPlaceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AdminPlaceResponse>> getActivePlaces(
            @PathVariable UUID destinationId,
            @RequestHeader("X-Tenant-Id") UUID tenantId) {
        return ResponseEntity.ok(service.getActivePlaces(destinationId, tenantId));
    }

    @GetMapping("/admin")
    public ResponseEntity<List<AdminPlaceResponse>> getAllPlaces(
            @PathVariable UUID destinationId,
            @RequestHeader("X-Tenant-Id") UUID tenantId) {
        return ResponseEntity.ok(service.getAllPlaces(destinationId, tenantId));
    }

    @PostMapping
    public ResponseEntity<AdminPlaceResponse> createPlace(
            @PathVariable UUID destinationId,
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @Valid @RequestBody AdminPlaceRequest request) {
        AdminPlaceResponse response = service.createPlace(destinationId, tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminPlaceResponse> updatePlace(
            @PathVariable UUID destinationId,
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @Valid @RequestBody AdminPlaceRequest request) {
        return ResponseEntity.ok(service.updatePlace(id, tenantId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePlace(
            @PathVariable UUID destinationId,
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-Id") UUID tenantId) {
        service.deletePlace(id, tenantId);
        return ResponseEntity.ok(Map.of("message", "Place deleted"));
    }
}
