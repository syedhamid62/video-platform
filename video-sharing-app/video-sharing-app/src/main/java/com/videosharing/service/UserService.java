package com.videosharing.service;

import com.videosharing.model.entity.User;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface UserService {
    User getCurrentUserProfile(Long userId);

    User updateProfile(Long userId, User updatedData);

    String uploadProfilePicture(Long userId, MultipartFile file) throws IOException;

    java.io.InputStream getProfilePictureStream(String url);
}
