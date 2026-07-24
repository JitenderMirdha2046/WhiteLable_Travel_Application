package com.travel.ai.controller;

import com.travel.ai.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/weather")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getWeather(@RequestParam String destination) {
        String summary = weatherService.getWeatherSummary(destination);
        return ResponseEntity.ok(Map.of(
            "destination", destination,
            "summary", summary
        ));
    }
}
