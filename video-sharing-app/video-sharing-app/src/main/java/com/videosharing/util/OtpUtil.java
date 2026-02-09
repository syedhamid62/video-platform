package com.videosharing.util;

import java.security.SecureRandom;

public class OtpUtil {

    private static final SecureRandom random = new SecureRandom();

    // 6 digit OTP
    public static String generateOtp() {
        return String.valueOf(100000 + random.nextInt(900000));
    }
}
