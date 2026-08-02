package com.travel.trip.repository;

import com.travel.trip.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface TripRepository extends JpaRepository<Trip, UUID> {
    List<Trip> findByUserIdAndTenantIdOrderByCreatedAtDesc(UUID userId, UUID tenantId);

    @Query("SELECT t.destination, COUNT(t) FROM Trip t WHERE t.tenantId = :tenantId GROUP BY t.destination ORDER BY COUNT(t) DESC")
    List<Object[]> findPopularDestinationsByTenant(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM Trip t WHERE t.userId = :userId AND t.tenantId = :tenantId AND " +
           "(LOWER(t.destination) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.travelType) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(COALESCE(t.moodDescription, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(COALESCE(t.itinerary, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY t.createdAt DESC")
    List<Trip> searchByKeyword(@Param("userId") UUID userId, @Param("tenantId") UUID tenantId, @Param("keyword") String keyword);

    long countByTenantId(UUID tenantId);

    long countByTenantIdAndTripStatus(UUID tenantId, String tripStatus);

    List<Trip> findTop5ByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    @Query("SELECT COALESCE(SUM(COALESCE(t.totalEstimatedCost, t.budget)), 0) FROM Trip t WHERE t.tenantId = :tenantId")
    BigDecimal sumEstimatedRevenue(@Param("tenantId") UUID tenantId);
}
