package com.videosharing.controller;

import com.videosharing.model.entity.User;
import com.videosharing.service.AuthService;
import com.videosharing.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getCurrentUser() {
        Long userId = (Long) authService.getCurrentUser().getId();
        return ResponseEntity.ok(userService.getCurrentUserProfile(userId));
    }

    @PutMapping("/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> updateProfile(@RequestBody User updatedData) {
        Long userId = (Long) authService.getCurrentUser().getId();
        return ResponseEntity.ok(userService.updateProfile(userId, updatedData));
    }

    @PostMapping(value = "/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) throws IOException {
        Long userId = (Long) authService.getCurrentUser().getId();
        String imageUrl = userService.uploadProfilePicture(userId, file);
        return ResponseEntity.ok(Map.of("profilePictureUrl", imageUrl));
    }

    @GetMapping("/profile-picture-proxy")
    public ResponseEntity<InputStreamResource> getProfilePicture(@RequestParam("url") String url) {
        InputStream stream = userService.getProfilePictureStream(url);
        if (stream == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType((org.springframework.http.MediaType) MediaType.IMAGE_JPEG)
                .body(new InputStreamResource(stream));
    }
}
