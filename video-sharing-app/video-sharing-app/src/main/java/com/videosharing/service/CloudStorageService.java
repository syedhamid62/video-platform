package com.videosharing.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudStorageService {

    String uploadVideo(MultipartFile file, Long userId, String title);

    String uploadProfilePicture(MultipartFile file, Long userId);

    String generateThumbnail(String videoUrl);

    void deleteVideo(String videoUrl);

    java.io.InputStream getFileStream(String fileKey);
}
