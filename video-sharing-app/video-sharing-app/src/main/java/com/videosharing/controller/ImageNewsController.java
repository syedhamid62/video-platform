package com.videosharing.controller;

import com.videosharing.model.entity.ImageNews;
import com.videosharing.service.AuthService;
import com.videosharing.service.ImageNewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/image-news")
@CrossOrigin(origins = "http://localhost:4200")
public class ImageNewsController {

    @Autowired
    private ImageNewsService imageNewsService;

    @Autowired
    private AuthService authService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ImageNews> uploadImageNews(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam("tags") String tags,
            @RequestParam("imageFiles") List<MultipartFile> imageFiles) throws IOException {

        Long userId = authService.getCurrentUser().getId();
        ImageNews news = imageNewsService.uploadImageNews(userId, title, description, location, tags, imageFiles);
        return ResponseEntity.ok(news);
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<ImageNews>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String location) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ImageNews> news = imageNewsService.getFeed(pageable, location);
        return ResponseEntity.ok(news);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImageNews> getImageNews(@PathVariable Long id) {
        return ResponseEntity.ok(imageNewsService.getImageNewsById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteImageNews(@PathVariable Long id) {
        imageNewsService.deleteImageNews(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/image/{index}")
    public ResponseEntity<org.springframework.core.io.InputStreamResource> getImage(@PathVariable Long id,
            @PathVariable int index) {
        ImageNews news = imageNewsService.getImageNewsById(id);
        String[] urls = news.getImageUrls().split(",");
        if (index < 0 || index >= urls.length) {
            return ResponseEntity.notFound().build();
        }

        // Use cloudStorageService to get the stream
        java.io.InputStream imageStream = imageNewsService.getImageStream(urls[index]);
        if (imageStream == null) {
            return ResponseEntity.notFound().build();
        }

        org.springframework.http.MediaType contentType = (org.springframework.http.MediaType) org.springframework.http.MediaType.IMAGE_JPEG;
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.IMAGE_JPEG)
                .body(new org.springframework.core.io.InputStreamResource(imageStream));
    }

    // Interactions
    @PostMapping("/{id}/like")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> likeImageNews(@PathVariable Long id) {
        Long userId = authService.getCurrentUser().getId();
        imageNewsService.likeImageNews(userId, id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> incrementView(@PathVariable Long id) {
        imageNewsService.incrementViewCount(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> incrementShare(@PathVariable Long id) {
        imageNewsService.incrementShareCount(id);
        return ResponseEntity.ok().build();
    }
}
