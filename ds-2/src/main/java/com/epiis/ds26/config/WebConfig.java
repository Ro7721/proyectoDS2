package com.epiis.ds26.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

        private static final String FILE_PREFIX = "file:";

        @Value("${app.storage.path}")
        private String storagePath;

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/course-images/**")
                                .addResourceLocations(
                                                FILE_PREFIX + storagePath + "/courses/");

                registry.addResourceHandler("/lesson-videos/**")
                                .addResourceLocations(
                                                FILE_PREFIX + storagePath + "/lessons/video/");

                registry.addResourceHandler("/lesson-files/**")
                                .addResourceLocations(
                                                FILE_PREFIX + storagePath + "/lessons/files/");
        }

}
