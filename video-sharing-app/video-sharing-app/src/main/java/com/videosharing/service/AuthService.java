package com.videosharing.service;

import com.videosharing.model.dto.AuthRequest;
import com.videosharing.model.dto.RegisterRequest;
import com.videosharing.model.dto.AuthResponse;
import com.videosharing.model.entity.User;
import org.springframework.security.core.Authentication;

public interface AuthService {

    void register(RegisterRequest registerRequest);

    void createAdmin(RegisterRequest registerRequest);

    AuthResponse verifyOtp(String email, String otp);

    AuthResponse login(AuthRequest authRequest);

    AuthResponse refreshToken(String refreshToken);

    void logout(String refreshToken);

    User getCurrentUser();

    Authentication authenticate(String email, String rawPassword);
}
