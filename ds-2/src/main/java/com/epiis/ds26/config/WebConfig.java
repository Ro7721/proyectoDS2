package com.epiis.ds26.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

        @Value("${app.storage.path}")
        private String storagePath;

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/course-images/**")
                                .addResourceLocations(
                                                "file:" + storagePath + "/courses/");

                registry.addResourceHandler("/lesson-videos/**")
                                .addResourceLocations(
                                                "file:" + storagePath + "/lessons/video/");

                registry.addResourceHandler("/lesson-files/**")
                                .addResourceLocations(
                                                "file:" + storagePath + "/lessons/files/");
        }

}
