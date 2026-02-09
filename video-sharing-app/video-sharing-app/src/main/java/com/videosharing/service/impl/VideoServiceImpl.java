package com.videosharing.service.impl;

import com.videosharing.model.dto.VideoUploadRequest;
import com.videosharing.model.entity.User;
import com.videosharing.model.entity.Video;
import com.videosharing.repository.UserRepository;
import com.videosharing.repository.VideoRepository;
import com.videosharing.service.VideoService;
import com.videosharing.service.CloudStorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service // 🔴 MUST
@Transactional
public class VideoServiceImpl implements VideoService {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudStorageService cloudStorageService;

    @Override
    public Video uploadVideo(Long userId, VideoUploadRequest request, MultipartFile videoFile, MultipartFile thumbnail, String type)
            throws IOException {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isImage = "image".equalsIgnoreCase(type);
        String videoUrl = null;
        String thumbnailUrl;

        if (isImage) {
            // For image news, we expect 'thumbnail' to contain the main image
            // Or 'videoFile' might be used as the image container if frontend sends it there
            MultipartFile imageFile = (thumbnail != null && !thumbnail.isEmpty()) ? thumbnail : videoFile;

            if (imageFile == null || imageFile.isEmpty()) {
                throw new IllegalArgumentException("Image file is required for image news");
            }

            thumbnailUrl = cloudStorageService.uploadVideo(imageFile, userId, "img_" + request.getTitle());
            // No video URL for image news
        } else {
            // Video Upload Logic
            if (videoFile == null || videoFile.isEmpty()) {
                throw new IllegalArgumentException("Video file is required");
            }
            videoUrl = cloudStorageService.uploadVideo(videoFile, userId, request.getTitle());

            // Handle Thumbnail
            if (thumbnail != null && !thumbnail.isEmpty()) {
                thumbnailUrl = cloudStorageService.uploadVideo(thumbnail, userId, "thumb_" + request.getTitle());
            } else {
                thumbnailUrl = cloudStorageService.generateThumbnail(videoUrl);
            }
        }

        Video video = new Video();
        video.setUser(user);
        video.setTitle(request.getTitle());
        video.setDescription(request.getDescription());
        video.setCategories(request.getCategories());
        video.setLocation(request.getLocation());
        video.setTags(request.getTags());
        video.setVideoUrl(videoUrl);
        video.setThumbnailUrl(thumbnailUrl);
        video.setStatus(Video.Status.PENDING);
        video.setContentType(isImage ? Video.ContentType.IMAGE : Video.ContentType.VIDEO);
        video.setLikesCount(0);
        video.setDislikesCount(0);
        video.setCreatedAt(LocalDateTime.now());
        video.setExpiresAt(LocalDateTime.now().plusDays(6));

        return videoRepository.save(video);
    }


    @Override
    public Page<Video> getFeed(Pageable pageable, String category, String location) {
        // Clean up "all" category if passed
        if ("all".equalsIgnoreCase(category)) {
            category = null;
        }
        return videoRepository.findByFilters(Video.Status.APPROVED, category, location, pageable);
    }

    @Override
    public Page<Video> search(String query, Pageable pageable) {
        return videoRepository.searchVideos(query, pageable);
    }

    @Override
    public List<String> getSuggestions(String query) {
        return videoRepository.findSuggestions(query, PageRequest.of(0, 10)); // Top 10 suggestions
    }

    @Override
    public Video getVideoById(Long videoId) {
        return videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));
    }

    @Override
    public List<Video> getUserVideos(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return videoRepository.findByUser(user);
    }

    @Override
    public void likeVideo(Long userId, Long videoId) {
        Video video = getVideoById(videoId);
        video.setLikesCount(video.getLikesCount() + 1);
        videoRepository.save(video);
    }

    @Override
    public void dislikeVideo(Long userId, Long videoId) {
        Video video = getVideoById(videoId);
        video.setDislikesCount(video.getDislikesCount() + 1);
        videoRepository.save(video);
    }

    @Override
    public void unlikeVideo(Long userId, Long videoId) {
        Video video = getVideoById(videoId);

        if (video.getLikesCount() > 0) {
            video.setLikesCount(video.getLikesCount() - 1);
        }
        if (video.getDislikesCount() > 0) {
            video.setDislikesCount(video.getDislikesCount() - 1);
        }

        videoRepository.save(video);
    }

    @Override
    public void approveVideo(Long videoId) {
        Video video = getVideoById(videoId);
        video.setStatus(Video.Status.APPROVED);
        // Expiration Logic: 6 days from APPROVAL date (as per user request "after approval... auto delete in 6 day")
        video.setExpiresAt(LocalDateTime.now().plusDays(6));
        videoRepository.save(video);
    }

    @Override
    public void rejectVideo(Long videoId, String reason) {
        Video video = getVideoById(videoId);
        video.setStatus(Video.Status.REJECTED);
        video.setRejectionReason(reason);
        videoRepository.save(video);
    }

    @Override
    public List<Video> getPendingVideos() {
        return videoRepository.findByStatus(Video.Status.PENDING);
    }

    @Override
    public void deleteVideo(Long videoId) {
        Video video = getVideoById(videoId);

        // delete from cloud
        cloudStorageService.deleteVideo(video.getVideoUrl());

        videoRepository.delete(video);
    }

    @Override
    public void scheduleVideoCleanup() {
        List<Video> expiredVideos = videoRepository.findByExpiresAtBefore(LocalDateTime.now());
        for (Video video : expiredVideos) {
            deleteVideo(video.getId());
        }
    }

    @Override
    public java.io.InputStream getVideoStream(Long videoId) {
        Video video = getVideoById(videoId);
        String videoUrl = video.getVideoUrl();
        // Extract Key from URL: https://endpoint/bucket/KEY
        // Format: endpoint + "/" + bucketName + "/" + fileName
        // We can just assume the last part is the key if we split by bucketName
        // Or simpler: The stored URL structure in Upload was: endpoint + "/" +
        // bucketName + "/" + fileName

        // Let's try to extract cleanly
        try {
            // Quick hack: split by "/" and take the last 2 parts? No, key might have
            // slashes (userId/...)
            // The upload logic: fileName = userId + "/" + timestamp + "_" + originalName
            // URL = endpoint + "/" + bucketName + "/" + fileName

            // Find bucketName index
            // Better: inject bucketName or just try to parse

            int bucketIndex = videoUrl.indexOf("/vedio-sharing/");
            if (bucketIndex != -1) {
                String key = videoUrl.substring(bucketIndex + "/vedio-sharing/".length());
                return cloudStorageService.getFileStream(key);
            }

            // Fallback or error
            throw new RuntimeException("Could not parse video URL key: " + videoUrl);

        } catch (Exception e) {
            throw new RuntimeException("Error streaming video", e);
        }
    }

    @Override
    public java.io.InputStream getThumbnailStream(Long videoId) {
        Video video = getVideoById(videoId);
        String url = video.getThumbnailUrl();

        if (url == null || url.contains("placehold.co")) {
            try {
                return java.net.URI.create(url).toURL().openStream();
            } catch (Exception e) {
                throw new RuntimeException("Failed to fetch placeholder thumbnail", e);
            }
        }

        try {
            int bucketIndex = url.indexOf("/vedio-sharing/");
            if (bucketIndex != -1) {
                String key = url.substring(bucketIndex + "/vedio-sharing/".length());
                return cloudStorageService.getFileStream(key);
            }
            throw new RuntimeException("Could not parse thumbnail URL key: " + url);
        } catch (Exception e) {
            throw new RuntimeException("Error streaming thumbnail", e);
        }
    }

    @Override
    public void addComment(Long userId, Long videoId, String text) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Video video = getVideoById(videoId);
        com.videosharing.model.entity.Comment comment = new com.videosharing.model.entity.Comment(user, video, text);
        commentRepository.save(comment);
    }

    @Override
    public List<com.videosharing.model.entity.Comment> getComments(Long videoId) {
        return commentRepository.findByVideoIdOrderByCreatedAtDesc(videoId);
    }

    @Override
    public void reportVideo(Long userId, Long videoId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Video video = getVideoById(videoId);
        com.videosharing.model.entity.Report report = new com.videosharing.model.entity.Report(user, video, reason);
        reportRepository.save(report);
    }

    @Override
    public void incrementShareCount(Long videoId) {
        Video video = getVideoById(videoId);
        video.setShareCount(video.getShareCount() + 1);
        videoRepository.save(video);
    }

    @Override
    public void incrementViewCount(Long videoId) {
        Video video = getVideoById(videoId);
        video.setViews(video.getViews() + 1);
        videoRepository.save(video);
    }

    @Autowired
    private com.videosharing.repository.CommentRepository commentRepository;

    @Autowired
    private com.videosharing.repository.ReportRepository reportRepository;
}
