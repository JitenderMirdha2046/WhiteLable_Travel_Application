package com.travel.trip.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic tripCreatedTopic() {
        return new NewTopic("trip-created", 1, (short) 1);
    }
}
