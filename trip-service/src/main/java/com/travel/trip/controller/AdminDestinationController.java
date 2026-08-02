package com.travel.trip.controller;

import com.travel.trip.dto.AdminDestinationRequest;
import com.travel.trip.dto.AdminDestinationResponse;
import com.travel.trip.service.AdminDestinationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenants/destinations")
public class AdminDestinationController {

    private final AdminDestinationService service;

    public AdminDestinationController(AdminDestinationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AdminDestinationResponse>> getActiveDestinations(
            @RequestHeader("X-Tenant-Id") UUID tenantId) {
        return ResponseEntity.ok(service.getActiveDestinations(tenantId));
    }

    @GetMapping("/admin")
    public ResponseEntity<List<AdminDestinationResponse>> getAllDestinations(
            @RequestHeader("X-Tenant-Id") UUID tenantId) {
        return ResponseEntity.ok(service.getAllDestinations(tenantId));
    }

    @PostMapping
    public ResponseEntity<AdminDestinationResponse> createDestination(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @Valid @RequestBody AdminDestinationRequest request) {
        AdminDestinationResponse response = service.createDestination(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminDestinationResponse> updateDestination(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @Valid @RequestBody AdminDestinationRequest request) {
        return ResponseEntity.ok(service.updateDestination(id, tenantId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDestination(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-Id") UUID tenantId) {
        service.deleteDestination(id, tenantId);
        return ResponseEntity.ok(Map.of("message", "Destination deleted"));
    }
}
