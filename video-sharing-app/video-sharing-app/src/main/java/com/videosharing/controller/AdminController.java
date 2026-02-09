package com.videosharing.controller;

import com.videosharing.model.entity.Video;
import com.videosharing.model.entity.User;
import com.videosharing.service.AdminService;
import com.videosharing.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private VideoService videoService;

    @Autowired
    private com.videosharing.service.ImageNewsService imageNewsService;

    @GetMapping("/pending-videos")
    public ResponseEntity<List<Video>> getPendingVideos() {
        List<Video> videos = videoService.getPendingVideos();
        return ResponseEntity.ok(videos);
    }

    @PutMapping("/videos/{videoId}/approve")
    public ResponseEntity<?> approveVideo(@PathVariable Long videoId) {
        videoService.approveVideo(videoId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/videos/{videoId}/reject")
    public ResponseEntity<?> rejectVideo(@PathVariable Long videoId, @RequestBody java.util.Map<String, String> body) {
        String reason = body.get("reason");
        videoService.rejectVideo(videoId, reason);
        return ResponseEntity.ok().build();
    }

    // Image News Management
    @GetMapping("/pending-image-news")
    public ResponseEntity<List<com.videosharing.model.entity.ImageNews>> getPendingImageNews() {
        return ResponseEntity.ok(imageNewsService.getPendingImageNews());
    }

    @PutMapping("/image-news/{id}/approve")
    public ResponseEntity<?> approveImageNews(@PathVariable Long id) {
        imageNewsService.approveImageNews(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/image-news/{id}/reject")
    public ResponseEntity<?> rejectImageNews(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String reason = body.get("reason");
        imageNewsService.rejectImageNews(id, reason);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/videos/{videoId}")
    public ResponseEntity<?> deleteVideo(@PathVariable Long videoId) {
        videoService.deleteVideo(videoId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(adminService.searchUsers(q));
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{userId}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long userId) {
        adminService.blockUser(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{userId}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long userId) {
        adminService.unblockUser(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/reports")
    public ResponseEntity<List<com.videosharing.model.entity.Report>> getAllReports() {
        return ResponseEntity.ok(adminService.getAllReports());
    }

    @DeleteMapping("/reports/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable Long reportId) {
        adminService.deleteReport(reportId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/videos/search")
    public ResponseEntity<org.springframework.data.domain.Page<Video>> adminSearchVideos(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.adminSearchVideos(q, pageable));
    }
}
