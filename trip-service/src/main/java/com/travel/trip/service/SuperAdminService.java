package com.travel.trip.service;

import com.travel.trip.dto.*;
import com.travel.trip.entity.SuperAdmin;
import com.travel.trip.entity.Tenant;
import com.travel.trip.exception.ResourceNotFoundException;
import com.travel.trip.exception.UnauthorizedException;
import com.travel.trip.repository.SuperAdminRepository;
import com.travel.trip.repository.TenantRepository;
import com.travel.trip.repository.TripRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SuperAdminService {

    private final SuperAdminRepository superAdminRepository;
    private final TenantRepository tenantRepository;
    private final TripRepository tripRepository;
    private final SecretKey secretKey;
    private final BCryptPasswordEncoder passwordEncoder;
    private final long jwtExpiration = 86400000L;

    public SuperAdminService(SuperAdminRepository superAdminRepository,
                             TenantRepository tenantRepository,
                             TripRepository tripRepository,
                             @Value("${app.jwt.secret}") String jwtSecret) {
        this.superAdminRepository = superAdminRepository;
        this.tenantRepository = tenantRepository;
        this.tripRepository = tripRepository;
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public SuperAdminResponse login(SuperAdminLoginRequest request) {
        SuperAdmin admin = superAdminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = generateToken(admin);
        return new SuperAdminResponse(admin.getId(), admin.getName(), admin.getEmail(), token);
    }

    public List<TenantDetailResponse> getAllTenants() {
        List<Tenant> tenants = tenantRepository.findAll();
        return tenants.stream()
                .map(this::toDetailResponse)
                .collect(Collectors.toList());
    }

    public TenantDetailResponse getTenantDetail(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        return toDetailResponse(tenant);
    }

    public TenantDetailResponse updateTenantStatus(UUID tenantId, String status) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        tenant.setStatus(status);
        tenantRepository.save(tenant);
        return toDetailResponse(tenant);
    }

    public TenantDetailResponse updateTenantPlan(UUID tenantId, String planType) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        tenant.setPlanType(planType);
        tenantRepository.save(tenant);
        return toDetailResponse(tenant);
    }

    public void deleteTenant(UUID tenantId) {
        if (!tenantRepository.existsById(tenantId)) {
            throw new ResourceNotFoundException("Tenant not found");
        }
        tenantRepository.deleteById(tenantId);
    }

    public Map<String, Object> getPlatformStats() {
        List<Tenant> allTenants = tenantRepository.findAll();

        long totalTenants = allTenants.size();
        long activeTenants = allTenants.stream().filter(t -> "active".equals(t.getStatus())).count();
        long trialTenants = allTenants.stream().filter(t -> "trial".equals(t.getStatus())).count();
        long suspendedTenants = allTenants.stream().filter(t -> "suspended".equals(t.getStatus())).count();

        long totalTrips = 0;
        for (Tenant t : allTenants) {
            totalTrips += tripRepository.countByTenantId(t.getId());
        }

        Map<String, Long> planBreakdown = new LinkedHashMap<>();
        planBreakdown.put("starter", allTenants.stream().filter(t -> "starter".equals(t.getPlanType())).count());
        planBreakdown.put("growth", allTenants.stream().filter(t -> "growth".equals(t.getPlanType())).count());
        planBreakdown.put("enterprise", allTenants.stream().filter(t -> "enterprise".equals(t.getPlanType())).count());
        planBreakdown.put("trial", allTenants.stream().filter(t -> "trial".equals(t.getPlanType())).count());

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalTenants", totalTenants);
        stats.put("activeTenants", activeTenants);
        stats.put("trialTenants", trialTenants);
        stats.put("suspendedTenants", suspendedTenants);
        stats.put("totalTrips", totalTrips);
        stats.put("planBreakdown", planBreakdown);
        return stats;
    }

    public void validateToken(String token) {
        try {
            var claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String role = claims.get("role", String.class);
            if (!"SUPER_ADMIN".equals(role)) {
                throw new UnauthorizedException("Invalid super admin token");
            }
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid or expired super admin token");
        }
    }

    private String generateToken(SuperAdmin admin) {
        return Jwts.builder()
                .subject(admin.getId().toString())
                .claim("name", admin.getName())
                .claim("email", admin.getEmail())
                .claim("role", "SUPER_ADMIN")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(secretKey)
                .compact();
    }

    private TenantDetailResponse toDetailResponse(Tenant tenant) {
        long tripCount = tripRepository.countByTenantId(tenant.getId());
        return new TenantDetailResponse(
                tenant.getId(), tenant.getName(), tenant.getSubdomain(), tenant.getDomain(),
                tenant.getPlanType(), tenant.getStatus(), tenant.getAdminEmail(),
                tenant.getLogoUrl(), tenant.getPrimaryColor(), tenant.getAccentColor(),
                tenant.getTagline(), tenant.getCreatedAt(), tripCount
        );
    }
}
