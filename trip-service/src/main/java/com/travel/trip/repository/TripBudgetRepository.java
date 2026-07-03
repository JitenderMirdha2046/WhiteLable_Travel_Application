package com.travel.trip.repository;

import com.travel.trip.entity.TripBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TripBudgetRepository extends JpaRepository<TripBudget, UUID> {
    Optional<TripBudget> findByTripId(UUID tripId);
}
