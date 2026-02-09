package com.videosharing.service;

import com.videosharing.model.entity.ImageNews;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ImageNewsService {
    ImageNews uploadImageNews(Long userId, String title, String description, String location, String tags,
            List<MultipartFile> files) throws IOException;

    Page<ImageNews> getFeed(Pageable pageable, String location);

    ImageNews getImageNewsById(Long id);

    void approveImageNews(Long id);

    void rejectImageNews(Long id, String reason);

    List<ImageNews> getPendingImageNews();

    void deleteImageNews(Long id);

    java.io.InputStream getImageStream(String imageUrl);

    // Interactions
    void likeImageNews(Long userId, Long id);

    void incrementViewCount(Long id);

    void incrementShareCount(Long id);
}
