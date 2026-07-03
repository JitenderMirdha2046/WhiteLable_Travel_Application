package com.travel.trip.repository;

import com.travel.trip.entity.SuperAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SuperAdminRepository extends JpaRepository<SuperAdmin, UUID> {
    Optional<SuperAdmin> findByEmail(String email);
}
