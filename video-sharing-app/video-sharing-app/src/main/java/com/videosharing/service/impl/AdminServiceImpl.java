package com.videosharing.service.impl;

import com.videosharing.model.entity.User;
import com.videosharing.model.entity.Video;
import com.videosharing.repository.UserRepository;
import com.videosharing.repository.VideoRepository;
import com.videosharing.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Override
    public List<Video> getPendingVideos() {
        return videoRepository.findByStatus(Video.Status.PENDING);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> searchUsers(String query) {
        return userRepository.searchUsers(query);
    }

    @Override
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Override
    public void blockUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    public void unblockUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setIsActive(true);
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public List<com.videosharing.model.entity.Report> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public void deleteReport(Long reportId) {
        reportRepository.deleteById(reportId);
    }

    @Override
    public void deleteVideo(Long videoId) {
        videoRepository.deleteById(videoId);
    }

    @Override
    public org.springframework.data.domain.Page<Video> adminSearchVideos(String query, org.springframework.data.domain.Pageable pageable) {
        return videoRepository.adminSearchVideos(query, pageable);
    }

    @Autowired
    private com.videosharing.repository.ReportRepository reportRepository;
}