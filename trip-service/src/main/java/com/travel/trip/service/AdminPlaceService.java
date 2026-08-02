package com.travel.trip.service;

import com.travel.trip.dto.AdminPlaceRequest;
import com.travel.trip.dto.AdminPlaceResponse;
import com.travel.trip.entity.AdminPlace;
import com.travel.trip.repository.AdminPlaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminPlaceService {

    private final AdminPlaceRepository repository;

    public AdminPlaceService(AdminPlaceRepository repository) {
        this.repository = repository;
    }

    public List<AdminPlaceResponse> getActivePlaces(UUID destinationId, UUID tenantId) {
        return repository.findByDestinationIdAndTenantIdAndIsActiveTrueOrderBySortOrderAsc(destinationId, tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AdminPlaceResponse> getAllPlaces(UUID destinationId, UUID tenantId) {
        return repository.findByDestinationIdAndTenantIdOrderBySortOrderAsc(destinationId, tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AdminPlaceResponse createPlace(UUID destinationId, UUID tenantId, AdminPlaceRequest request) {
        AdminPlace entity = new AdminPlace();
        entity.setTenantId(tenantId);
        entity.setDestinationId(destinationId);
        applyRequest(entity, request);
        entity = repository.save(entity);
        return toResponse(entity);
    }

    public AdminPlaceResponse updatePlace(UUID id, UUID tenantId, AdminPlaceRequest request) {
        AdminPlace entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Place not found"));
        if (!entity.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied");
        }
        applyRequest(entity, request);
        entity = repository.save(entity);
        return toResponse(entity);
    }

    public void deletePlace(UUID id, UUID tenantId) {
        AdminPlace entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Place not found"));
        if (!entity.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied");
        }
        repository.delete(entity);
    }

    private void applyRequest(AdminPlace entity, AdminPlaceRequest request) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setImageUrl(request.getImageUrl());
        entity.setTimeRequired(request.getTimeRequired());
        entity.setEntryCost(request.getEntryCost());
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
        if (request.getSortOrder() != null) entity.setSortOrder(request.getSortOrder());
    }

    private AdminPlaceResponse toResponse(AdminPlace entity) {
        AdminPlaceResponse r = new AdminPlaceResponse();
        r.setId(entity.getId());
        r.setTenantId(entity.getTenantId());
        r.setDestinationId(entity.getDestinationId());
        r.setName(entity.getName());
        r.setDescription(entity.getDescription());
        r.setImageUrl(entity.getImageUrl());
        r.setTimeRequired(entity.getTimeRequired());
        r.setEntryCost(entity.getEntryCost());
        r.setIsActive(entity.getIsActive());
        r.setSortOrder(entity.getSortOrder());
        r.setCreatedAt(entity.getCreatedAt());
        return r;
    }
}
