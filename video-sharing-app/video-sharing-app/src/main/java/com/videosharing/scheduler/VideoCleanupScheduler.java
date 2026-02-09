package com.videosharing.scheduler;

import com.videosharing.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class VideoCleanupScheduler {

    @Autowired
    private VideoService videoService;

    // Run every hour
    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredVideos() {
        System.out.println("Running scheduled video cleanup...");
        videoService.scheduleVideoCleanup();
    }
}
