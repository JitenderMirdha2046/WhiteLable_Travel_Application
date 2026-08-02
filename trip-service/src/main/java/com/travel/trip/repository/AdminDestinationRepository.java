package com.travel.trip.repository;

import com.travel.trip.entity.AdminDestination;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AdminDestinationRepository extends JpaRepository<AdminDestination, UUID> {
    List<AdminDestination> findByTenantIdOrderBySortOrderAsc(UUID tenantId);
    List<AdminDestination> findByTenantIdAndIsActiveTrueOrderBySortOrderAsc(UUID tenantId);
}
