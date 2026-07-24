package com.travel.ai.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AI Service API")
                        .description("Gemini-powered itinerary generation, mood analysis, destination comparison")
                        .version("1.0.0")
                        .contact(new Contact().name("TravelPlanner")));
    }
}
