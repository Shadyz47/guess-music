package com.projectb.musicback.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.audio-directory}")
    private String audioDirectory;

    @Value("${app.upload.image-directory}")
    private String imageDirectory;

    public void addResourceHandlers(ResourceHandlerRegistry registry){
        Path audioPath = Paths.get(audioDirectory)
                .toAbsolutePath()
                .normalize();

        registry.addResourceHandler("/audio/**")
                .addResourceLocations(audioPath.toUri().toString());

        Path imagePath = Paths.get(imageDirectory)
                .toAbsolutePath()
                .normalize();

        registry.addResourceHandler("/image/**")
                .addResourceLocations(imagePath.toUri().toString());
    }

    @Override
    public void addCorsMappings(
            CorsRegistry registry
    ) {
        registry
                .addMapping("/api/**")
                .allowedOrigins("http://127.0.0.1:8082")
                .allowedMethods("GET");
    }
}
