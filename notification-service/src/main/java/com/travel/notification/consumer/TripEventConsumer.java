package com.travel.notification.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class TripEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(TripEventConsumer.class);
    private final ObjectMapper objectMapper;

    public TripEventConsumer() {
        this.objectMapper = new ObjectMapper();
    }

    @KafkaListener(topics = "trip-events", groupId = "notification-service-group")
    public void consume(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("eventType").asText();

            switch (eventType) {
                case "TRIP_CREATED":
                    handleTripCreated(event);
                    break;
                case "TRIP_COMPLETED":
                    handleTripCompleted(event);
                    break;
                case "TRIP_FAILED":
                    handleTripFailed(event);
                    break;
                default:
                    log.info("Received event: {}", eventType);
                    break;
            }
        } catch (Exception e) {
            log.error("Error processing event: {}", e.getMessage());
        }
    }

    private void handleTripCreated(JsonNode event) {
        String tripId = event.get("tripId").asText();
        String userId = event.get("userId").asText();
        log.info("Notification: Trip {} created for user {}. Itinerary generation started.", tripId, userId);
        // In a real app, this would send push/email notification
    }

    private void handleTripCompleted(JsonNode event) {
        String tripId = event.get("tripId").asText();
        log.info("Notification: Trip {} itinerary is ready!", tripId);
    }

    private void handleTripFailed(JsonNode event) {
        String tripId = event.get("tripId").asText();
        log.error("Notification: Trip {} generation failed.", tripId);
    }
}
