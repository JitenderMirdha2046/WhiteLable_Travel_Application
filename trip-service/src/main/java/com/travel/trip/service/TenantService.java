package com.travel.trip.service;

import com.travel.trip.dto.*;
import com.travel.trip.entity.Tenant;
import com.travel.trip.exception.DuplicateResourceException;
import com.travel.trip.exception.ResourceNotFoundException;
import com.travel.trip.exception.UnauthorizedException;
import com.travel.trip.repository.TenantRepository;
import com.travel.trip.repository.TripRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final TripRepository tripRepository;
    private final SecretKey secretKey;
    private final BCryptPasswordEncoder passwordEncoder;
    private final long jwtExpiration = 86400000L;

    public TenantService(TenantRepository tenantRepository,
                         TripRepository tripRepository,
                         @Value("${app.jwt.secret}") String jwtSecret) {
        this.tenantRepository = tenantRepository;
        this.tripRepository = tripRepository;
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public TenantAuthResponse register(TenantRegisterRequest request) {
        if (request.getSubdomain() != null && tenantRepository.findBySubdomain(request.getSubdomain()).isPresent()) {
            throw new DuplicateResourceException("Subdomain already taken");
        }
        if (request.getDomain() != null && tenantRepository.findByDomain(request.getDomain()).isPresent()) {
            throw new DuplicateResourceException("Domain already registered");
        }
        if (tenantRepository.findByAdminEmail(request.getAdminEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already registered");
        }

        String rawSubdomain = request.getSubdomain() != null
                ? request.getSubdomain()
                : request.getAgencyName().toLowerCase().replaceAll("\\s+", "") + ".travelplanner.com";
        String subdomain = rawSubdomain.toLowerCase();

        Tenant tenant = new Tenant();
        tenant.setName(request.getAgencyName());
        tenant.setAdminEmail(request.getAdminEmail());
        tenant.setAdminPassword(passwordEncoder.encode(request.getAdminPassword()));
        tenant.setSubdomain(subdomain);
        tenant.setDomain(request.getDomain());
        tenant.setPrimaryColor("#3b82f6");
        tenant.setAccentColor("#a855f7");
        tenant.setPlanType("trial");
        tenant.setStatus("trial");

        tenantRepository.save(tenant);

        String token = generateAdminToken(tenant.getId(), tenant.getName());
        return new TenantAuthResponse(tenant.getId(), tenant.getName(), token,
                subdomain, "trial", "trial");
    }

    public TenantAuthResponse login(TenantLoginRequest request) {
        Tenant tenant = tenantRepository.findByAdminEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), tenant.getAdminPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = generateAdminToken(tenant.getId(), tenant.getName());
        return new TenantAuthResponse(tenant.getId(), tenant.getName(), token,
                tenant.getSubdomain(), tenant.getPlanType(), tenant.getStatus());
    }

    public BrandingResponse getBranding(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        return toBrandingResponse(tenant);
    }

    public BrandingResponse getBrandingBySubdomain(String subdomain) {
        Tenant tenant = tenantRepository.findBySubdomain(subdomain)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        return toBrandingResponse(tenant);
    }

    public BrandingResponse updateBranding(UUID tenantId, BrandingRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        if (request.getLogoUrl() != null) tenant.setLogoUrl(request.getLogoUrl());
        if (request.getBackgroundImage() != null) tenant.setBackgroundImage(request.getBackgroundImage());
        if (request.getOverlayOpacity() != null) tenant.setOverlayOpacity(request.getOverlayOpacity());
        if (request.getOverlayBlur() != null) tenant.setOverlayBlur(request.getOverlayBlur());
        if (request.getTemplateStyle() != null) tenant.setTemplateStyle(request.getTemplateStyle());
        if (request.getPrimaryColor() != null) tenant.setPrimaryColor(request.getPrimaryColor());
        if (request.getAccentColor() != null) tenant.setAccentColor(request.getAccentColor());
        if (request.getTagline() != null) tenant.setTagline(request.getTagline());
        if (request.getOrbIntensity() != null) tenant.setOrbIntensity(request.getOrbIntensity());
        if (request.getLatitude() != null) tenant.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) tenant.setLongitude(request.getLongitude());
        if (request.getPhone() != null) tenant.setPhone(request.getPhone());
        if (request.getAddress() != null) tenant.setAddress(request.getAddress());

        tenantRepository.save(tenant);
        return toBrandingResponse(tenant);
    }

    public BrandingResponse uploadLogo(UUID tenantId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        try {
            String uploadDir = "uploads/logos";
            Files.createDirectories(Paths.get(uploadDir));

            String filename = "logo_" + tenantId + "_" + System.currentTimeMillis()
                    + file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.'));
            Path filePath = Paths.get(uploadDir, filename);
            file.transferTo(filePath);

            Tenant tenant = tenantRepository.findById(tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
            String logoUrl = "/uploads/logos/" + filename;
            tenant.setLogoUrl(logoUrl);
            tenantRepository.save(tenant);

            return toBrandingResponse(tenant);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload logo", e);
        }
    }

    public void validateAdminToken(UUID tenantId, String token) {
        try {
            var claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String tokenTenantId = claims.get("tenantId", String.class);
            String role = claims.get("role", String.class);

            if (!UUID.fromString(tokenTenantId).equals(tenantId) || !"ADMIN".equals(role)) {
                throw new UnauthorizedException("Invalid admin token");
            }
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid or expired admin token");
        }
    }

    public Map<String, Object> getAdminStats(UUID tenantId, String adminToken) {
        validateAdminToken(tenantId, adminToken);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalTrips", tripRepository.countByTenantId(tenantId));
        stats.put("aiGenerations", tripRepository.countByTenantIdAndTripStatus(tenantId, "COMPLETED"));

        BigDecimal revenue = tripRepository.sumEstimatedRevenue(tenantId);
        stats.put("totalRevenue", revenue != null ? revenue : BigDecimal.ZERO);

        List<Object[]> popularRows = tripRepository.findPopularDestinationsByTenant(tenantId);
        List<Map<String, Object>> popular = new ArrayList<>();
        for (Object[] row : popularRows) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("destination", row[0]);
            entry.put("count", row[1]);
            popular.add(entry);
        }
        stats.put("popularDestinations", popular);

        List<Map<String, Object>> recentTrips = new ArrayList<>();
        tripRepository.findTop5ByTenantIdOrderByCreatedAtDesc(tenantId).forEach(trip -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", trip.getId());
            entry.put("userId", trip.getUserId());
            entry.put("destination", trip.getDestination());
            entry.put("budget", trip.getBudget());
            entry.put("days", trip.getDays());
            entry.put("travelType", trip.getTravelType());
            entry.put("tripStatus", trip.getTripStatus());
            entry.put("status", trip.getStatus());
            entry.put("createdAt", trip.getCreatedAt());
            recentTrips.add(entry);
        });
        stats.put("recentTrips", recentTrips);

        return stats;
    }

    private String generateAdminToken(UUID tenantId, String agencyName) {
        return Jwts.builder()
                .subject(tenantId.toString())
                .claim("agencyName", agencyName)
                .claim("role", "ADMIN")
                .claim("tenantId", tenantId.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(secretKey)
                .compact();
    }

    private BrandingResponse toBrandingResponse(Tenant tenant) {
        return new BrandingResponse(
                tenant.getId(),
                tenant.getName(),
                tenant.getLogoUrl(),
                tenant.getBackgroundImage(),
                tenant.getOverlayOpacity(),
                tenant.getOverlayBlur(),
                tenant.getTemplateStyle(),
                tenant.getPrimaryColor(),
                tenant.getAccentColor(),
                tenant.getTagline(),
                tenant.getSubdomain(),
                tenant.getOrbIntensity(),
                tenant.getLatitude(),
                tenant.getLongitude(),
                tenant.getPhone(),
                tenant.getAddress()
        );
    }
}
