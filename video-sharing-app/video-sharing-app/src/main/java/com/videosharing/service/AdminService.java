package com.videosharing.service;

import com.videosharing.model.entity.User;
import com.videosharing.model.entity.Video;
import java.util.List;

public interface AdminService {
    List<Video> getPendingVideos();
    List<User> getAllUsers();
    void toggleUserStatus(Long userId);
    void deleteUser(Long userId);
    List<User> searchUsers(String query);
    void blockUser(Long userId);
    void unblockUser(Long userId);
    List<com.videosharing.model.entity.Report> getAllReports();
    void deleteReport(Long reportId);
    void deleteVideo(Long videoId);
    org.springframework.data.domain.Page<Video> adminSearchVideos(String query, org.springframework.data.domain.Pageable pageable);
}
