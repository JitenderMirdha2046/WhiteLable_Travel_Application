package com.travel.trip.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travel.trip.config.TenantContext;
import com.travel.trip.dto.*;
import com.travel.trip.entity.*;
import com.travel.trip.exception.ResourceNotFoundException;
import com.travel.trip.exception.UnauthorizedException;
import com.travel.trip.repository.*;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final TripBudgetRepository tripBudgetRepository;
    private final TripComparisonRepository tripComparisonRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public TripService(
            TripRepository tripRepository,
            TripBudgetRepository tripBudgetRepository,
            TripComparisonRepository tripComparisonRepository,
            RedisTemplate<String, Object> redisTemplate,
            KafkaTemplate<String, String> kafkaTemplate) {
        this.tripRepository = tripRepository;
        this.tripBudgetRepository = tripBudgetRepository;
        this.tripComparisonRepository = tripComparisonRepository;
        this.redisTemplate = redisTemplate;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public TripResponse createTrip(CreateTripRequest request, UUID userId) {
        UUID tenantId = request.getTenantId() != null
                ? request.getTenantId()
                : TenantContext.getTenantId();

        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant ID is required to create a trip");
        }

        Trip trip = new Trip();
        trip.setUserId(userId);
        trip.setTenantId(tenantId);
        trip.setDestination(request.getDestination());
        trip.setBudget(request.getBudget());
        trip.setDays(request.getDays());
        trip.setTravelType(request.getTravelType());
        trip.setMoodDescription(request.getMoodDescription());
        if (request.getSelectedPlaces() != null && !request.getSelectedPlaces().isEmpty()) {
            trip.setSelectedPlaces(String.join(",", request.getSelectedPlaces()));
        }
        trip.setTripStatus("PENDING");
        trip.setStatus("ACTIVE");
        trip.setCacheUsed(false);

        trip.setTripStatus("GENERATING");
        tripRepository.saveAndFlush(trip);

        try {
            String event = objectMapper.writeValueAsString(Map.of(
                "tripId", trip.getId().toString(),
                "userId", userId.toString(),
                "tenantId", tenantId.toString(),
                "eventType", "TRIP_CREATED"
            ));
            kafkaTemplate.send("trip-events", event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send Kafka event", e);
        }

        TripResponse response = toResponse(trip);
        return response;
    }

    public List<TripResponse> getUserTrips(UUID userId) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant context is required");
        }
        return tripRepository.findByUserIdAndTenantIdOrderByCreatedAtDesc(userId, tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TripResponse> searchTrips(UUID userId, String keyword) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant context is required");
        }
        if (keyword == null || keyword.trim().isEmpty()) {
            return getUserTrips(userId);
        }
        return tripRepository.searchByKeyword(userId, tenantId, keyword.trim())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TripResponse getTripById(UUID id, UUID userId) {
        UUID tenantId = TenantContext.getTenantId();
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        if (!trip.getUserId().equals(userId) || !trip.getTenantId().equals(tenantId)) {
            throw new UnauthorizedException("Access denied");
        }
        TripResponse response = toResponse(trip);
        tripBudgetRepository.findByTripId(id).ifPresent(budget -> {
            TripResponse.TripBudgetDto budgetDto = new TripResponse.TripBudgetDto();
            budgetDto.setHotelCost(budget.getHotelCost());
            budgetDto.setFoodCost(budget.getFoodCost());
            budgetDto.setTransportCost(budget.getTransportCost());
            budgetDto.setActivityCost(budget.getActivityCost());
            budgetDto.setMiscCost(budget.getMiscCost());
            response.setBudgetBreakdown(budgetDto);
        });
        return response;
    }

    public TripResponse.TripBudgetDto getTripBudget(UUID tripId, UUID userId) {
        UUID tenantId = TenantContext.getTenantId();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        if (!trip.getUserId().equals(userId) || !trip.getTenantId().equals(tenantId)) {
            throw new UnauthorizedException("Access denied");
        }
        TripBudget budget = tripBudgetRepository.findByTripId(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        TripResponse.TripBudgetDto dto = new TripResponse.TripBudgetDto();
        dto.setHotelCost(budget.getHotelCost());
        dto.setFoodCost(budget.getFoodCost());
        dto.setTransportCost(budget.getTransportCost());
        dto.setActivityCost(budget.getActivityCost());
        dto.setMiscCost(budget.getMiscCost());
        return dto;
    }

    public void deleteTrip(UUID id, UUID userId) {
        UUID tenantId = TenantContext.getTenantId();
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        if (!trip.getUserId().equals(userId) || !trip.getTenantId().equals(tenantId)) {
            throw new UnauthorizedException("Access denied");
        }
        tripRepository.delete(trip);
    }

    public TripResponse replanTrip(ReplanRequest request, UUID userId) {
        UUID tenantId = TenantContext.getTenantId();
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        if (!trip.getUserId().equals(userId) || !trip.getTenantId().equals(tenantId)) {
            throw new UnauthorizedException("Access denied");
        }
        trip.setTripStatus("GENERATING");
        trip.setCacheUsed(false);
        tripRepository.save(trip);

        try {
            String event = objectMapper.writeValueAsString(Map.of(
                "tripId", request.getTripId().toString(),
                "userId", userId.toString(),
                "tenantId", tenantId.toString(),
                "eventType", "TRIP_REPLAN",
                "instruction", request.getInstruction()
            ));
            kafkaTemplate.send("trip-events", event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send Kafka event", e);
        }

        return toResponse(trip);
    }

    public ComparisonResponse compareTrips(UUID userId, String destination) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant context is required");
        }
        List<TripComparison> comparisons = tripComparisonRepository
                .findByUserIdAndTenantIdAndDestinationOrderByComparisonType(userId, tenantId, destination);

        if (comparisons.isEmpty()) {
            try {
                String event = objectMapper.writeValueAsString(Map.of(
                    "userId", userId.toString(),
                    "destination", destination,
                    "tenantId", tenantId.toString(),
                    "eventType", "COMPARE_REQUESTED"
                ));
                kafkaTemplate.send("trip-events", event);
            } catch (Exception e) {
                throw new RuntimeException("Failed to send Kafka event", e);
            }

            throw new ResourceNotFoundException("Comparison generation started. Please try again shortly.");
        }

        ComparisonResponse response = new ComparisonResponse();
        response.setDestination(destination);
        response.setPlans(comparisons.stream().map(c -> {
            ComparisonResponse.PlanDto plan = new ComparisonResponse.PlanDto();
            plan.setType(c.getComparisonType());
            plan.setItinerary(c.getItinerary());
            return plan;
        }).collect(Collectors.toList()));

        return response;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        try {
            Set<String> keys = redisTemplate.keys("trip::*");
            stats.put("cachedTrips", keys != null ? keys.size() : 0);
            Object hits = redisTemplate.opsForValue().get("cache:hits");
            Object misses = redisTemplate.opsForValue().get("cache:misses");
            stats.put("cacheHits", hits != null ? hits : 0);
            stats.put("cacheMisses", misses != null ? misses : 0);
        } catch (Exception e) {
            stats.put("cachedTrips", 0);
            stats.put("cacheHits", 0);
            stats.put("cacheMisses", 0);
        }
        return stats;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getPopularDestinations() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            return List.of();
        }
        try {
            String cacheKey = "analytics:popular_destinations:" + tenantId;
            List<Map<String, Object>> cached = (List<Map<String, Object>>) redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) return cached;
        } catch (Exception ignored) {}

        List<Object[]> results = tripRepository.findPopularDestinationsByTenant(tenantId);
        List<Map<String, Object>> popular = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("destination", row[0]);
            entry.put("count", row[1]);
            popular.add(entry);
        }

        try {
            redisTemplate.opsForValue().set("analytics:popular_destinations:" + tenantId, popular,
                    java.time.Duration.ofHours(1));
        } catch (Exception ignored) {}

        return popular;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getAdminAnalytics() {
        UUID tenantId = TenantContext.getTenantId();
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalTrips", tenantId != null ? tripRepository.countByTenantId(tenantId) : 0);

        try {
            analytics.put("cacheStats", getCacheStats());
        } catch (Exception e) {
            analytics.put("cacheStats", "unavailable");
        }

        try {
            analytics.put("popularDestinations", getPopularDestinations());
        } catch (Exception e) {
            analytics.put("popularDestinations", List.of());
        }

        try {
            Set<String> keys = redisTemplate.keys("rate-limit:*");
            analytics.put("activeRateLimitBuckets", keys != null ? keys.size() : 0);
        } catch (Exception e) {
            analytics.put("activeRateLimitBuckets", 0);
        }

        return analytics;
    }

    private TripResponse toResponse(Trip trip) {
        TripResponse response = new TripResponse();
        response.setId(trip.getId());
        response.setUserId(trip.getUserId());
        response.setTenantId(trip.getTenantId());
        response.setDestination(trip.getDestination());
        response.setBudget(trip.getBudget());
        response.setDays(trip.getDays());
        response.setTravelType(trip.getTravelType());
        response.setMoodDescription(trip.getMoodDescription());
        response.setTripStatus(trip.getTripStatus());
        response.setWeatherSummary(trip.getWeatherSummary());
        response.setCacheUsed(trip.getCacheUsed());
        response.setTotalEstimatedCost(trip.getTotalEstimatedCost());
        response.setItinerary(trip.getItinerary());
        response.setSelectedPlaces(trip.getSelectedPlaces());
        response.setStatus(trip.getStatus());
        response.setCreatedAt(trip.getCreatedAt());
        return response;
    }
}
