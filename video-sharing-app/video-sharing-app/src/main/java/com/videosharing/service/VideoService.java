package com.videosharing.service;

import com.videosharing.model.dto.VideoUploadRequest;
import com.videosharing.model.entity.Comment;
import com.videosharing.model.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface VideoService {
    Video uploadVideo(Long userId, VideoUploadRequest request, MultipartFile videoFile, MultipartFile thumbnail, String type)
            throws IOException;


    Page<Video> getFeed(Pageable pageable, String category, String location);

    Page<Video> search(String query, Pageable pageable);

    List<String> getSuggestions(String query);

    Video getVideoById(Long videoId);

    List<Video> getUserVideos(Long userId);

    void likeVideo(Long userId, Long videoId);

    void dislikeVideo(Long userId, Long videoId);

    void unlikeVideo(Long userId, Long videoId);

    // Interactions
    void addComment(Long userId, Long videoId, String text);
    List<Comment> getComments(Long videoId);
    void reportVideo(Long userId, Long videoId, String reason);
    void incrementShareCount(Long videoId);
    void incrementViewCount(Long videoId);

    void approveVideo(Long videoId);

    void rejectVideo(Long videoId, String reason);

    List<Video> getPendingVideos();

    void deleteVideo(Long videoId);

    void scheduleVideoCleanup();

    java.io.InputStream getVideoStream(Long videoId);

    java.io.InputStream getThumbnailStream(Long videoId);
}