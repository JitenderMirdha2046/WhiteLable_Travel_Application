package com.travel.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GeminiService(@Value("${gemini.api.key}") String apiKey,
                         @Value("${gemini.api.url}") String apiUrl) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder().baseUrl(apiUrl).build();
        this.objectMapper = new ObjectMapper();
        log.info("GeminiService initialized with API key: {}...", apiKey.length() > 10 ? apiKey.substring(0, 10) : "short");
    }

    public String generateItinerary(String destination, String travelType, int days,
                                    String moodDescription, boolean isReplan, String instruction) {
        if ("placeholder-key".equals(apiKey)) {
            return generateFallbackItinerary(destination, travelType, days, moodDescription);
        }

        StringBuilder prompt = new StringBuilder();
        prompt.append("Create a detailed ").append(days).append("-day travel itinerary for ")
              .append(destination).append(". Travel type: ").append(travelType).append(".");

        if (moodDescription != null && !moodDescription.isBlank()) {
            prompt.append(" Mood/Vibe: ").append(moodDescription).append(".");
        }

        if (isReplan && instruction != null) {
            prompt.append(" Modify the previous plan: ").append(instruction).append(".");
        }

        prompt.append(" Include daily activities, restaurants, and estimated costs per day.");

        try {
            Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                    Map.of("parts", new Object[]{
                        Map.of("text", prompt.toString())
                    })
                }
            );

            String response = webClient.post()
                    .uri("?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            JsonNode text = root.path("candidates").get(0)
                               .path("content").path("parts").get(0).path("text");
            return text.asText();
        } catch (Exception e) {
            log.error("Gemini API call failed: {} - {}: {}", e.getClass().getSimpleName(), e.getMessage(),
                      e.getCause() != null ? e.getCause().getMessage() : "");
            return generateFallbackItinerary(destination, travelType, days, moodDescription);
        }
    }

    public String analyzeMood(String moodDescription) {
        if ("placeholder-key".equals(apiKey)) {
            return getFallbackMoodAnalysis(moodDescription);
        }
        try {
            String prompt = "Analyze the following travel mood/vibe preference: '" + moodDescription
                    + "'. Suggest destinations, activities, and travel style that match.";

            Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                    Map.of("parts", new Object[]{
                        Map.of("text", prompt)
                    })
                }
            );

            String response = webClient.post()
                    .uri("?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            JsonNode text = root.path("candidates").get(0)
                               .path("content").path("parts").get(0).path("text");
            return text.asText();
        } catch (Exception e) {
            return getFallbackMoodAnalysis(moodDescription);
        }
    }

    public String compareDestinations(String destination) {
        if ("placeholder-key".equals(apiKey)) {
            return getFallbackComparison(destination);
        }
        try {
            String prompt = "Compare different travel approaches for a trip to " + destination
                    + ". Provide 3 distinct itinerary options: budget-friendly, luxury, and adventure-focused.";

            Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                    Map.of("parts", new Object[]{
                        Map.of("text", prompt)
                    })
                }
            );

            String response = webClient.post()
                    .uri("?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            JsonNode text = root.path("candidates").get(0)
                               .path("content").path("parts").get(0).path("text");
            return text.asText();
        } catch (Exception e) {
            return getFallbackComparison(destination);
        }
    }

    private String generateFallbackItinerary(String destination, String travelType, int days,
                                              String moodDescription) {
        StringBuilder sb = new StringBuilder();
        sb.append("Day 1: Arrival in ").append(destination).append("\n");
        sb.append("- Check into hotel (").append(destination).append(" City Center)\n");
        sb.append("- Explore local markets\n");
        sb.append("- Welcome dinner at a traditional restaurant\n\n");

        if (days >= 2) {
            sb.append("Day 2: City Exploration\n");
            sb.append("- Breakfast at hotel\n");
            sb.append("- Visit main attractions\n");
            sb.append("- Lunch at popular café\n");
            sb.append("- Afternoon shopping\n");
            sb.append("- Dinner at local cuisine spot\n\n");
        }

        if (days >= 3) {
            sb.append("Day 3: Cultural Experience\n");
            sb.append("- Visit museums and heritage sites\n");
            sb.append("- Attend cultural show\n");
            sb.append("- Street food tour in the evening\n\n");
        }

        if (days >= 4) {
            sb.append("Day 4: Adventure & Recreation\n");
            sb.append("- Outdoor activities\n");
            sb.append("- Visit natural attractions\n");
            sb.append("- Sunset viewing point\n\n");
        }

        if (days >= 5) {
            sb.append("Day 5: Departure\n");
            sb.append("- Final breakfast\n");
            sb.append("- Souvenir shopping\n");
            sb.append("- Transfer to airport\n\n");
        }

        sb.append("\nBudget Estimate: Approximately $").append(days * 200).append(" per person\n");
        sb.append("Total Estimated Cost: $").append(days * 250).append("\n");

        return sb.toString();
    }

    private String getFallbackMoodAnalysis(String moodDescription) {
        return "Based on your mood '" + moodDescription + "', we recommend:\n"
             + "- Relaxed beach destinations with spa facilities\n"
             + "- Nature walks and scenic viewpoints\n"
             + "- Fine dining experiences\n"
             + "- Cultural tours and museum visits";
    }

    private String getFallbackComparison(String destination) {
        return "=== Budget-Friendly Plan ===\n"
             + "- Stay in hostels or budget hotels\n"
             + "- Use public transportation\n"
             + "- Street food and local eateries\n"
             + "- Free walking tours\n\n"
             + "=== Luxury Plan ===\n"
             + "- 5-star hotel with premium amenities\n"
             + "- Private transfers and tours\n"
             + "- Fine dining at top restaurants\n"
             + "- VIP experiences and spa\n\n"
             + "=== Adventure Plan ===\n"
             + "- Eco-lodges and camping\n"
             + "- Hiking, biking, water sports\n"
             + "- Local food adventures\n"
             + "- Off-the-beaten-path exploration";
    }
}
