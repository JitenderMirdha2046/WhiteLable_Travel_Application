package com.travel.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final Map<String, CachedWeather> weatherCache = new ConcurrentHashMap<>();

    private static final long CACHE_TTL_MS = 30 * 60 * 1000;

    private static final Map<String, String> DESTINATION_WEATHER = Map.ofEntries(
        Map.entry("Goa", "Goa"),
        Map.entry("Manali", "Manali"),
        Map.entry("Jaipur", "Jaipur"),
        Map.entry("Kerala", "Kerala"),
        Map.entry("Ladakh", "Leh"),
        Map.entry("Udaipur", "Udaipur"),
        Map.entry("Sikkim", "Gangtok"),
        Map.entry("Andaman", "Port Blair"),
        Map.entry("Delhi", "Delhi"),
        Map.entry("Mumbai", "Mumbai"),
        Map.entry("Bangalore", "Bangalore"),
        Map.entry("Chennai", "Chennai"),
        Map.entry("Kolkata", "Kolkata"),
        Map.entry("Agra", "Agra"),
        Map.entry("Varanasi", "Varanasi"),
        Map.entry("Rishikesh", "Rishikesh")
    );

    public WeatherService(
            @Value("${weather.api.key}") String apiKey,
            @Value("${weather.api.url}") String weatherUrl) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl(weatherUrl)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String getWeatherSummary(String destination) {
        String city = DESTINATION_WEATHER.getOrDefault(destination, destination);

        CachedWeather cached = weatherCache.get(city);
        if (cached != null && System.currentTimeMillis() - cached.timestamp < CACHE_TTL_MS) {
            log.debug("Returning cached weather for {}", city);
            return cached.summary;
        }

        if ("placeholder-key".equals(apiKey) || apiKey == null || apiKey.isBlank()) {
            return getFallbackWeather(destination);
        }

        try {
            String response = webClient.get()
                    .uri("/weather?q={city}&appid={apiKey}&units=metric", city, apiKey)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            double temp = root.path("main").path("temp").asDouble();
            double feelsLike = root.path("main").path("feels_like").asDouble();
            int humidity = root.path("main").path("humidity").asInt();
            String description = root.path("weather").get(0).path("description").asText();
            double windSpeed = root.path("wind").path("speed").asDouble();

            String summary = String.format(
                "☀️ %s: %s, %.1f°C (feels like %.1f°C), Humidity: %d%%, Wind: %.1f m/s",
                destination, description, temp, feelsLike, humidity, windSpeed
            );

            weatherCache.put(city, new CachedWeather(summary, System.currentTimeMillis()));
            return summary;

        } catch (Exception e) {
            log.warn("OpenWeatherMap API call failed for {}: {} - {}, using fallback", city,
                     e.getClass().getSimpleName(), e.getMessage());
            return getFallbackWeather(destination);
        }
    }

    private String getFallbackWeather(String destination) {
        java.time.LocalDate now = java.time.LocalDate.now();
        int month = now.getMonthValue();

        if (month >= 3 && month <= 6) {
            return String.format(
                "%s: Summer season. Expect temperatures between 25-40°C. Light cotton clothing recommended. Stay hydrated and use sun protection.",
                destination
            );
        } else if (month >= 7 && month <= 10) {
            return String.format(
                "%s: Monsoon season. Expect temperatures between 22-32°C with moderate to heavy rainfall. Carry an umbrella and waterproof gear.",
                destination
            );
        } else {
            return String.format(
                "%s: Winter season. Expect temperatures between 10-25°C depending on region. Pack layers and warm clothing for evenings.",
                destination
            );
        }
    }

    private static class CachedWeather {
        final String summary;
        final long timestamp;

        CachedWeather(String summary, long timestamp) {
            this.summary = summary;
            this.timestamp = timestamp;
        }
    }
}
