package com.travel.trip.controller;

import com.travel.trip.dto.*;
import com.travel.trip.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @PostMapping("/register")
    public ResponseEntity<TenantAuthResponse> register(@Valid @RequestBody TenantRegisterRequest request) {
        TenantAuthResponse response = tenantService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<TenantAuthResponse> login(@Valid @RequestBody TenantLoginRequest request) {
        TenantAuthResponse response = tenantService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/branding")
    public ResponseEntity<BrandingResponse> getBranding(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestParam(value = "subdomain", required = false) String subdomain) {
        if (tenantId != null) {
            return ResponseEntity.ok(tenantService.getBranding(tenantId));
        }
        if (subdomain != null) {
            return ResponseEntity.ok(tenantService.getBrandingBySubdomain(subdomain));
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BrandingResponse> uploadLogo(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestHeader("X-Admin-Token") String adminToken,
            @RequestParam("file") MultipartFile file) {
        tenantService.validateAdminToken(tenantId, adminToken);
        return ResponseEntity.ok(tenantService.uploadLogo(tenantId, file));
    }

    @PutMapping("/branding")
    public ResponseEntity<BrandingResponse> updateBranding(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestHeader("X-Admin-Token") String adminToken,
            @Valid @RequestBody BrandingRequest request) {
        tenantService.validateAdminToken(tenantId, adminToken);
        return ResponseEntity.ok(tenantService.updateBranding(tenantId, request));
    }
}
