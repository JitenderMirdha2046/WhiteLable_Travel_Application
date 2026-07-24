package com.travel.user.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/avatars}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = uploadDir.startsWith("/") ? uploadDir : "/app/" + uploadDir;
        int idx = location.lastIndexOf("/");
        String base = idx > 0 ? location.substring(0, idx) + "/" : "/app/uploads/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + base);
    }
}
