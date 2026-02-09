package com.videosharing.service.impl;

import com.videosharing.model.entity.ImageNews;
import com.videosharing.model.entity.User;
import com.videosharing.repository.ImageNewsRepository;
import com.videosharing.repository.UserRepository;
import com.videosharing.service.CloudStorageService;
import com.videosharing.service.ImageNewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ImageNewsServiceImpl implements ImageNewsService {

    @Autowired
    private ImageNewsRepository imageNewsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudStorageService cloudStorageService;

    @Override
    public ImageNews uploadImageNews(Long userId, String title, String description, String location, String tags,
            List<MultipartFile> files) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("At least one image is required");
        }

        if (files.size() > 5) {
            throw new IllegalArgumentException("Maximum 5 images allowed");
        }

        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                String url = cloudStorageService.uploadVideo(file, userId, "news_" + title); // Reusing uploadVideo for
                                                                                             // general file upload
                imageUrls.add(url);
            }
        }

        ImageNews news = new ImageNews();
        news.setUser(user);
        news.setTitle(title);
        news.setDescription(description);
        news.setLocation(location);
        news.setTags(tags);
        news.setImageUrls(String.join(",", imageUrls));
        news.setStatus(ImageNews.Status.PENDING);
        news.setCreatedAt(LocalDateTime.now());
        news.setExpiresAt(LocalDateTime.now().plusDays(6));

        return imageNewsRepository.save(news);
    }

    @Override
    public Page<ImageNews> getFeed(Pageable pageable, String location) {
        // Temporarily include PENDING to help user see their uploads
        return imageNewsRepository.findByFilters(null, location, pageable);
    }

    @Override
    public ImageNews getImageNewsById(Long id) {
        return imageNewsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image news not found"));
    }

    @Override
    public void approveImageNews(Long id) {
        ImageNews news = getImageNewsById(id);
        news.setStatus(ImageNews.Status.APPROVED);
        news.setExpiresAt(LocalDateTime.now().plusDays(6));
        imageNewsRepository.save(news);
    }

    @Override
    public void rejectImageNews(Long id, String reason) {
        ImageNews news = getImageNewsById(id);
        news.setStatus(ImageNews.Status.REJECTED);
        news.setRejectionReason(reason);
        imageNewsRepository.save(news);
    }

    @Override
    public List<ImageNews> getPendingImageNews() {
        return imageNewsRepository.findByStatus(ImageNews.Status.PENDING);
    }

    @Override
    public void deleteImageNews(Long id) {
        ImageNews news = getImageNewsById(id);
        if (news.getImageUrls() != null && !news.getImageUrls().isEmpty()) {
            String[] urls = news.getImageUrls().split(",");
            for (String url : urls) {
                cloudStorageService.deleteVideo(url);
            }
        }
        imageNewsRepository.delete(news);
    }

    @Override
    public java.io.InputStream getImageStream(String imageUrl) {
        // The imageUrl is likely a full URL or a key depending on how
        // cloudStorageService stores it.
        // Looking at ImageNewsServiceImpl line 50:
        // cloudStorageService.uploadVideo(file, userId, "news_" + title)
        // If it returns a full URL, we need to extract the key if getFileStream expects
        // a key.
        try {
            int bucketIndex = imageUrl.indexOf("/vedio-sharing/");
            if (bucketIndex != -1) {
                String key = imageUrl.substring(bucketIndex + "/vedio-sharing/".length());
                return cloudStorageService.getFileStream(key);
            }
            throw new RuntimeException("Could not parse image URL key: " + imageUrl);
        } catch (Exception e) {
            throw new RuntimeException("Error streaming image", e);
        }
    }

    @Override
    public void likeImageNews(Long userId, Long id) {
        ImageNews news = getImageNewsById(id);
        news.setLikesCount(news.getLikesCount() + 1);
        imageNewsRepository.save(news);
    }

    @Override
    public void incrementViewCount(Long id) {
        ImageNews news = getImageNewsById(id);
        news.setViews(news.getViews() + 1);
        imageNewsRepository.save(news);
    }

    @Override
    public void incrementShareCount(Long id) {
        ImageNews news = getImageNewsById(id);
        news.setShareCount(news.getShareCount() + 1);
        imageNewsRepository.save(news);
    }
}
