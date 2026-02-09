package com.videosharing.controller;

import com.videosharing.model.dto.VideoUploadRequest;
import com.videosharing.model.entity.Video;
import com.videosharing.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin(origins = "http://localhost:4200")
public class VideoController {

    @Autowired
    private VideoService videoService;

    @Autowired
    private com.videosharing.service.AuthService authService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<Video> uploadVideo(
            @RequestParam(value = "videoFile", required = false) MultipartFile videoFile,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam("tags") String tags,
            @RequestParam("categories") String categories,
            @RequestParam(value = "type", required = false, defaultValue = "video") String type) throws IOException { // Added type

        System.out.println("--- RECEIVED UPLOAD REQUEST ---");
        System.out.println("Type: " + type);
        System.out.println("Title: " + title);

        VideoUploadRequest request = new VideoUploadRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setCategories(categories);
        request.setLocation(location);
        request.setTags(tags);

        Long userId = authService.getCurrentUser().getId();

        try {
            Video video = videoService.uploadVideo(userId, request, videoFile, thumbnail, type);
            return ResponseEntity.ok(video);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<Video>> getVideoFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location) {

        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        Page<Video> videos = videoService.getFeed(pageable, category, location);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Video>> searchVideos(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size); // Can add sort by relevance or date if needed
        Page<Video> videos = videoService.search(q, pageable);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam String q) {
        List<String> suggestions = videoService.getSuggestions(q);
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/{videoId}")
    public ResponseEntity<Video> getVideo(@PathVariable Long videoId) {
        Video video = videoService.getVideoById(videoId);
        return ResponseEntity.ok(video);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Video>> getUserVideos(@PathVariable Long userId) {
        List<Video> videos = videoService.getUserVideos(userId);
        return ResponseEntity.ok(videos);
    }

    @PostMapping("/{videoId}/like")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> likeVideo(@PathVariable Long videoId) {
        // Get current user ID from security context
        Long userId = authService.getCurrentUser().getId();
        videoService.likeVideo(userId, videoId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{videoId}/dislike")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> dislikeVideo(@PathVariable Long videoId) {
        // Get current user ID from security context
        Long userId = authService.getCurrentUser().getId();
        videoService.dislikeVideo(userId, videoId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{videoId}/unlike")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> unlikeVideo(@PathVariable Long videoId) {
        // Get current user ID from security context
        Long userId = authService.getCurrentUser().getId();
        videoService.unlikeVideo(userId, videoId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{videoId}/stream")
    public ResponseEntity<org.springframework.core.io.InputStreamResource> streamVideo(@PathVariable Long videoId) {
        java.io.InputStream videoStream = videoService.getVideoStream(videoId);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType("video/mp4"))
                .body(new org.springframework.core.io.InputStreamResource(videoStream));
    }

    @GetMapping("/{videoId}/thumbnail")
    public ResponseEntity<org.springframework.core.io.InputStreamResource> getThumbnail(@PathVariable Long videoId) {
        java.io.InputStream thumbStream = videoService.getThumbnailStream(videoId);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.IMAGE_JPEG)
                .body(new org.springframework.core.io.InputStreamResource(thumbStream));
    }

    // --- Interactions --- //

    @PostMapping("/{videoId}/comments")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> addComment(@PathVariable Long videoId, @RequestBody java.util.Map<String, String> body) {
        Long userId = authService.getCurrentUser().getId();
        String text = body.get("text");
        videoService.addComment(userId, videoId, text);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{videoId}/comments")
    public ResponseEntity<List<com.videosharing.model.entity.Comment>> getComments(@PathVariable Long videoId) {
        return ResponseEntity.ok(videoService.getComments(videoId));
    }

    @PostMapping("/{videoId}/report")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> reportVideo(@PathVariable Long videoId, @RequestBody java.util.Map<String, String> body) {
        Long userId = authService.getCurrentUser().getId();
        String reason = body.get("reason");
        videoService.reportVideo(userId, videoId, reason);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{videoId}/share")
    public ResponseEntity<?> incrementShare(@PathVariable Long videoId) {
        videoService.incrementShareCount(videoId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{videoId}/view")
    public ResponseEntity<?> incrementView(@PathVariable Long videoId) {
        videoService.incrementViewCount(videoId);
        return ResponseEntity.ok().build();
    }
}