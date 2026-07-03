package com.travel.trip.controller;

import com.travel.trip.dto.*;
import com.travel.trip.service.SuperAdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/super")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    public SuperAdminController(SuperAdminService superAdminService) {
        this.superAdminService = superAdminService;
    }

    @PostMapping("/login")
    public ResponseEntity<SuperAdminResponse> login(@Valid @RequestBody SuperAdminLoginRequest request) {
        return ResponseEntity.ok(superAdminService.login(request));
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<TenantDetailResponse>> getAllTenants(@RequestHeader("X-Super-Token") String token) {
        superAdminService.validateToken(token);
        return ResponseEntity.ok(superAdminService.getAllTenants());
    }

    @GetMapping("/tenants/{id}")
    public ResponseEntity<TenantDetailResponse> getTenantDetail(
            @RequestHeader("X-Super-Token") String token,
            @PathVariable UUID id) {
        superAdminService.validateToken(token);
        return ResponseEntity.ok(superAdminService.getTenantDetail(id));
    }

    @PutMapping("/tenants/{id}/status")
    public ResponseEntity<TenantDetailResponse> updateTenantStatus(
            @RequestHeader("X-Super-Token") String token,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        superAdminService.validateToken(token);
        return ResponseEntity.ok(superAdminService.updateTenantStatus(id, body.get("status")));
    }

    @PutMapping("/tenants/{id}/plan")
    public ResponseEntity<TenantDetailResponse> updateTenantPlan(
            @RequestHeader("X-Super-Token") String token,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        superAdminService.validateToken(token);
        return ResponseEntity.ok(superAdminService.updateTenantPlan(id, body.get("planType")));
    }

    @DeleteMapping("/tenants/{id}")
    public ResponseEntity<Void> deleteTenant(
            @RequestHeader("X-Super-Token") String token,
            @PathVariable UUID id) {
        superAdminService.validateToken(token);
        superAdminService.deleteTenant(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestHeader("X-Super-Token") String token) {
        superAdminService.validateToken(token);
        return ResponseEntity.ok(superAdminService.getPlatformStats());
    }
}
