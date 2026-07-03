package com.travel.trip.repository;

import com.travel.trip.entity.TripComparison;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TripComparisonRepository extends JpaRepository<TripComparison, UUID> {
    List<TripComparison> findByUserIdAndTenantIdAndDestinationOrderByComparisonType(UUID userId, UUID tenantId, String destination);
}
