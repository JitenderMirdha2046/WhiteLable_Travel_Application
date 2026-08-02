package com.travel.trip.service;

import com.travel.trip.dto.AdminDestinationRequest;
import com.travel.trip.dto.AdminDestinationResponse;
import com.travel.trip.dto.AdminPlaceResponse;
import com.travel.trip.entity.AdminDestination;
import com.travel.trip.repository.AdminDestinationRepository;
import com.travel.trip.repository.AdminPlaceRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminDestinationService {

    private final AdminDestinationRepository repository;
    private final AdminPlaceRepository placeRepository;

    public AdminDestinationService(AdminDestinationRepository repository, AdminPlaceRepository placeRepository) {
        this.repository = repository;
        this.placeRepository = placeRepository;
    }

    public List<AdminDestinationResponse> getActiveDestinations(UUID tenantId) {
        return repository.findByTenantIdAndIsActiveTrueOrderBySortOrderAsc(tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AdminDestinationResponse> getAllDestinations(UUID tenantId) {
        return repository.findByTenantIdOrderBySortOrderAsc(tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AdminDestinationResponse createDestination(UUID tenantId, AdminDestinationRequest request) {
        AdminDestination entity = new AdminDestination();
        entity.setTenantId(tenantId);
        applyRequest(entity, request);
        entity = repository.save(entity);
        return toResponse(entity);
    }

    public AdminDestinationResponse updateDestination(UUID id, UUID tenantId, AdminDestinationRequest request) {
        AdminDestination entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));
        if (!entity.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied");
        }
        applyRequest(entity, request);
        entity = repository.save(entity);
        return toResponse(entity);
    }

    public void deleteDestination(UUID id, UUID tenantId) {
        AdminDestination entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));
        if (!entity.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied");
        }
        repository.delete(entity);
    }

    private void applyRequest(AdminDestination entity, AdminDestinationRequest request) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setImageUrl(request.getImageUrl());
        entity.setEstimatedCost(request.getEstimatedCost());
        entity.setTravelTypes(serializeTypes(request.getTravelTypes()));
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
        if (request.getSortOrder() != null) entity.setSortOrder(request.getSortOrder());
        if (request.getActiveStartHour() != null) entity.setActiveStartHour(request.getActiveStartHour());
        if (request.getActiveEndHour() != null) entity.setActiveEndHour(request.getActiveEndHour());
    }

    private AdminDestinationResponse toResponse(AdminDestination entity) {
        AdminDestinationResponse r = new AdminDestinationResponse();
        r.setId(entity.getId());
        r.setTenantId(entity.getTenantId());
        r.setName(entity.getName());
        r.setDescription(entity.getDescription());
        r.setImageUrl(entity.getImageUrl());
        r.setEstimatedCost(entity.getEstimatedCost());
        r.setTravelTypes(deserializeTypes(entity.getTravelTypes()));
        r.setIsActive(entity.getIsActive());
        r.setSortOrder(entity.getSortOrder());
        r.setActiveStartHour(entity.getActiveStartHour());
        r.setActiveEndHour(entity.getActiveEndHour());
        r.setCreatedAt(entity.getCreatedAt());
        r.setPlaces(toPlaceResponses(entity.getId(), entity.getTenantId()));
        return r;
    }

    private List<AdminPlaceResponse> toPlaceResponses(UUID destinationId, UUID tenantId) {
        return placeRepository.findByDestinationIdAndTenantIdAndIsActiveTrueOrderBySortOrderAsc(destinationId, tenantId)
                .stream()
                .map(p -> {
                    AdminPlaceResponse pr = new AdminPlaceResponse();
                    pr.setId(p.getId());
                    pr.setTenantId(p.getTenantId());
                    pr.setDestinationId(p.getDestinationId());
                    pr.setName(p.getName());
                    pr.setDescription(p.getDescription());
                    pr.setImageUrl(p.getImageUrl());
                    pr.setTimeRequired(p.getTimeRequired());
                    pr.setEntryCost(p.getEntryCost());
                    pr.setIsActive(p.getIsActive());
                    pr.setSortOrder(p.getSortOrder());
                    pr.setCreatedAt(p.getCreatedAt());
                    return pr;
                })
                .collect(Collectors.toList());
    }

    private String serializeTypes(List<String> types) {
        if (types == null || types.isEmpty()) return "";
        return String.join(",", types);
    }

    private List<String> deserializeTypes(String types) {
        if (types == null || types.isBlank()) return Collections.emptyList();
        return Arrays.stream(types.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
