package com.travel.trip.repository;

import com.travel.trip.entity.AdminPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AdminPlaceRepository extends JpaRepository<AdminPlace, UUID> {
    List<AdminPlace> findByDestinationIdAndTenantIdOrderBySortOrderAsc(UUID destinationId, UUID tenantId);
    List<AdminPlace> findByDestinationIdAndTenantIdAndIsActiveTrueOrderBySortOrderAsc(UUID destinationId, UUID tenantId);
}
