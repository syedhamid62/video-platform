package com.videosharing.service.impl;

import com.videosharing.model.entity.User;
import com.videosharing.repository.UserRepository;
import com.videosharing.service.CloudStorageService;
import com.videosharing.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudStorageService cloudStorageService;

    @Override
    public User getCurrentUserProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    @Transactional
    public User updateProfile(Long userId, User updatedData) {
        User user = getCurrentUserProfile(userId);

        if (updatedData.getDisplayUsername() != null) {
            user.setDisplayUsername(updatedData.getDisplayUsername());
        }
        if (updatedData.getFirstName() != null) {
            user.setFirstName(updatedData.getFirstName());
        }
        if (updatedData.getLastName() != null) {
            user.setLastName(updatedData.getLastName());
        }
        if (updatedData.getBio() != null) {
            user.setBio(updatedData.getBio());
        }
        if (updatedData.getContactNumber() != null) {
            user.setContactNumber(updatedData.getContactNumber());
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public String uploadProfilePicture(Long userId, MultipartFile file) throws IOException {
        User user = getCurrentUserProfile(userId);

        // Use the dedicated uploadProfilePicture method which puts it in "users/"
        String imageUrl = cloudStorageService.uploadProfilePicture(file, userId);

        user.setProfilePictureUrl(imageUrl);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return imageUrl;
    }

    @Override
    public InputStream getProfilePictureStream(String url) {
        return cloudStorageService.getFileStream(url);
    }
}
