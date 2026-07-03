package com.travel.trip.repository;

import com.travel.trip.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    Optional<Tenant> findByDomain(String domain);
    Optional<Tenant> findBySubdomain(String subdomain);
    Optional<Tenant> findByAdminEmail(String adminEmail);

    Optional<Tenant> findBySubdomainIgnoreCase(String subdomain);
}
