package com.travel.ai.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travel.ai.service.GeminiService;
import com.travel.ai.service.WeatherService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class TripEventConsumer {

    private final GeminiService geminiService;
    private final WeatherService weatherService;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public TripEventConsumer(GeminiService geminiService, WeatherService weatherService, JdbcTemplate jdbcTemplate) {
        this.geminiService = geminiService;
        this.weatherService = weatherService;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = new ObjectMapper();
    }

    @KafkaListener(topics = "trip-events", groupId = "ai-service-group")
    public void consume(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("eventType").asText();

            switch (eventType) {
                case "TRIP_CREATED":
                case "TRIP_REPLAN":
                    handleTripGeneration(event);
                    break;
                case "COMPARE_REQUESTED":
                    handleComparison(event);
                    break;
                default:
                    break;
            }
        } catch (Exception e) {
            System.err.println("Error processing event: " + e.getMessage());
        }
    }

    private void handleTripGeneration(JsonNode event) {
        try {
            String tripId = event.get("tripId").asText();
            String instruction = event.has("instruction") ? event.get("instruction").asText() : null;
            boolean isReplan = instruction != null && !instruction.isBlank();

            UUID tripUuid = UUID.fromString(tripId);

            var trip = jdbcTemplate.queryForMap(
                "SELECT destination, days, travel_type, mood_description FROM trips WHERE id = ?",
                tripUuid
            );

            String destination = (String) trip.get("destination");
            int days = ((Number) trip.get("days")).intValue();
            String travelType = (String) trip.get("travel_type");
            String moodDescription = (String) trip.get("mood_description");

            String itinerary = geminiService.generateItinerary(
                destination, travelType, days, moodDescription, isReplan, instruction
            );

            BigDecimal totalCost = estimateTotalCost(itinerary, days);

            int updated = jdbcTemplate.update(
                "UPDATE trips SET itinerary = ?, total_estimated_cost = ?, trip_status = ?, weather_summary = ? WHERE id = ?",
                itinerary, totalCost, "COMPLETED", weatherService.getWeatherSummary(destination), tripUuid
            );

            if (updated > 0) {
                insertBudgetBreakdown(tripUuid, totalCost, days);
            }

        } catch (Exception e) {
            try {
                jdbcTemplate.update(
                    "UPDATE trips SET trip_status = ? WHERE id = ?",
                    "FAILED", UUID.fromString(event.get("tripId").asText())
                );
            } catch (Exception ignored) {}
        }
    }

    private void handleComparison(JsonNode event) {
        try {
            String userId = event.get("userId").asText();
            String destination = event.get("destination").asText();
            UUID tenantId = event.has("tenantId") ? UUID.fromString(event.get("tenantId").asText()) : null;

            String comparisonResult = geminiService.compareDestinations(destination);

            String[] plans = comparisonResult.split("===");
            for (String planSection : plans) {
                planSection = planSection.trim();
                if (planSection.isEmpty()) continue;

                String type;
                if (planSection.contains("Budget")) type = "BUDGET";
                else if (planSection.contains("Luxury")) type = "LUXURY";
                else if (planSection.contains("Adventure")) type = "ADVENTURE";
                else type = "GENERAL";

                jdbcTemplate.update(
                    "INSERT INTO trip_comparison (id, user_id, tenant_id, destination, comparison_type, itinerary) VALUES (?, ?, ?, ?, ?, ?)",
                    UUID.randomUUID(), UUID.fromString(userId), tenantId, destination, type, planSection
                );
            }
        } catch (Exception e) {
            System.err.println("Error handling comparison: " + e.getMessage());
        }
    }

    private BigDecimal estimateTotalCost(String itinerary, int days) {
        try {
            String[] lines = itinerary.split("\n");
            for (String line : lines) {
                if (line.toLowerCase().contains("total") && line.toLowerCase().contains("estimated")) {
                    String[] parts = line.replaceAll("[^0-9.]", " ").trim().split("\\s+");
                    for (String part : parts) {
                        if (!part.isEmpty()) {
                            return new BigDecimal(part);
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
        return BigDecimal.valueOf(days * 250);
    }

    private void insertBudgetBreakdown(UUID tripId, BigDecimal total, int days) {
        BigDecimal perDay = total.divide(BigDecimal.valueOf(days), 2, java.math.RoundingMode.HALF_UP);
        jdbcTemplate.update(
            "INSERT INTO trip_budget (id, trip_id, hotel_cost, food_cost, transport_cost, activity_cost, misc_cost) VALUES (?, ?, ?, ?, ?, ?, ?)",
            UUID.randomUUID(), tripId,
            perDay.multiply(BigDecimal.valueOf(days * 0.4)),
            perDay.multiply(BigDecimal.valueOf(days * 0.2)),
            perDay.multiply(BigDecimal.valueOf(days * 0.2)),
            perDay.multiply(BigDecimal.valueOf(days * 0.15)),
            perDay.multiply(BigDecimal.valueOf(days * 0.05))
        );
    }

}
