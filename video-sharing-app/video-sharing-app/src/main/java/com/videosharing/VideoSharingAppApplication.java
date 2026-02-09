package com.videosharing;

import com.videosharing.model.entity.Role;
import com.videosharing.model.entity.User;
import com.videosharing.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VideoSharingAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(VideoSharingAppApplication.class, args);
	}

	@Bean
	CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (!userRepository.existsByEmail("admin@videoshare.com")) {
				User admin = new User();
				admin.setEmail("admin@videoshare.com");
				admin.setDisplayUsername("admin");
				admin.setFirstName("Super");
				admin.setLastName("Admin");
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setRole(Role.ADMIN);
				admin.setIsActive(true);
				userRepository.save(admin);
				System.out.println("---------------------------------------");
				System.out.println("ADMIN ACCOUNT CREATED: admin@videoshare.com / admin123");
				System.out.println("---------------------------------------");
			} else {
				// Determine if we should reset it (Optional, but user forgot password)
				// For simplicity, we just print that it exists.
				// To RESET, we would need to find and update.
				// Let's UPDATE it to ensure the password is known.
				User admin = userRepository.findByEmail("admin@videoshare.com").orElseThrow();
				admin.setPassword(passwordEncoder.encode("admin123"));
				userRepository.save(admin);
				System.out.println("---------------------------------------");
				System.out.println("ADMIN PASSWORD RESET: admin@videoshare.com / admin123");
				System.out.println("---------------------------------------");
			}
		};
	}
}
