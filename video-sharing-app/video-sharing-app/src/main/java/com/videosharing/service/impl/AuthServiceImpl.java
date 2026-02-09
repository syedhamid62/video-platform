package com.videosharing.service.impl;

import com.videosharing.model.dto.AuthRequest;
import com.videosharing.model.dto.AuthResponse;
import com.videosharing.model.dto.RegisterRequest;
import com.videosharing.model.dto.UserDto;
import com.videosharing.model.entity.RefreshToken;
import com.videosharing.model.entity.Role;
import com.videosharing.model.entity.User;
import com.videosharing.repository.RefreshTokenRepository;
import com.videosharing.repository.UserRepository;
import com.videosharing.service.AuthService;
import com.videosharing.service.EmailService;
import com.videosharing.util.JwtUtil;
import com.videosharing.util.OtpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    // ================= REGISTER (SEND OTP) =================
    @Override
    public void register(RegisterRequest registerRequest) {
        // Normalize email
        registerRequest.setEmail(registerRequest.getEmail().trim().toLowerCase());

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }

        User user = new User(
                registerRequest.getEmail(),
                registerRequest.getUsername(),
                registerRequest.getFirstName(),
                registerRequest.getLastName());

        user.setContactNumber(registerRequest.getContactNumber());

        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(Role.USER);
        user.setIsActive(false); // OTP verify ke baad true hoga

        // ✅ SAVE USER
        User savedUser = userRepository.save(user);

        // ✅ GENERATE OTP
        String otp = OtpUtil.generateOtp();

        // 🔥 MOST IMPORTANT: OTP DB ME SAVE KARO
        savedUser.setOtp(otp);
        userRepository.save(savedUser);

        // ✅ SEND OTP EMAIL
        emailService.sendOtp(savedUser.getEmail(), otp);
    }

    @Override
    public void createAdmin(RegisterRequest registerRequest) {
        // Normalize email
        registerRequest.setEmail(registerRequest.getEmail().trim().toLowerCase());
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Admin with this email already exists");
        }

        User user = new User(
                registerRequest.getEmail(),
                registerRequest.getUsername(),
                registerRequest.getFirstName(),
                registerRequest.getLastName());

        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(Role.ADMIN);
        user.setIsActive(true); // Admin is active by default

        userRepository.save(user);
    }

    // ================= VERIFY OTP =================
    @Override
    public AuthResponse verifyOtp(String email, String otp) {
        // Normalize email
        email = email.trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String dbOtp = user.getOtp(); // ✅ OTP FROM DB

        if (dbOtp == null) {
            throw new RuntimeException("OTP expired or not generated");
        }

        if (!dbOtp.equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        // ✅ OTP VERIFIED
        user.setIsActive(true);
        user.setOtp(null); // OTP clear
        userRepository.save(user);

        String accessToken = jwtUtil.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole());

        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        RefreshToken refreshTokenEntity = new RefreshToken(
                user,
                refreshToken,
                LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(refreshTokenEntity);

        return new AuthResponse(accessToken, refreshToken, convertToDto(user));
    }

    // ================= LOGIN =================
    @Override
    public AuthResponse login(AuthRequest authRequest) {

        Authentication authentication = authenticate(
                authRequest.getEmail(),
                authRequest.getPassword());

        User user = (User) authentication.getPrincipal();

        if (!user.getIsActive()) {
            throw new RuntimeException("Please verify OTP first");
        }

        String accessToken = jwtUtil.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole());

        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        refreshTokenRepository.findByUser(user)
                .ifPresent(refreshTokenRepository::delete);

        RefreshToken refreshTokenEntity = new RefreshToken(
                user,
                refreshToken,
                LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(refreshTokenEntity);

        return new AuthResponse(accessToken, refreshToken, convertToDto(user));
    }

    // ================= LOGOUT =================
    @Override
    public void logout(String refreshToken) {

        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        token.setIsRevoked(true);
        refreshTokenRepository.save(token);
    }

    // ================= CURRENT USER =================
    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            System.err.println("getCurrentUser: No authenticated user found in SecurityContext!");
            return null;
        }
        return (User) authentication.getPrincipal();
    }

    // ================= AUTHENTICATE =================
    @Override
    public Authentication authenticate(String email, String rawPassword) {
        // Normalize email
        email = email.trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities());
    }

    // ================= DTO CONVERTER =================
    private UserDto convertToDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setUsername(user.getUsername());
        userDto.setFirstName(user.getFirstName());
        userDto.setLastName(user.getLastName());
        userDto.setProfilePictureUrl(user.getProfilePictureUrl());
        userDto.setContactNumber(user.getContactNumber());
        userDto.setRole(user.getRole().toString());
        return userDto;
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        // TODO Auto-generated method stub
        return null;
    }
}
