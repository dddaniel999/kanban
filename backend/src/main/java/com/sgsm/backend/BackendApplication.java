package com.sgsm.backend;

import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

//	@Bean
//	public CommandLineRunner initUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
//		return args -> {
//			if (userRepository.findByUsername("admin").isEmpty()) {
//				User user = new User();
//				user.setUsername("admin");
//				user.setEmail("admin@sgsm.com");
//				user.setPassword(passwordEncoder.encode("admin123"));
//				user.setRole("MANAGER");
//
//				userRepository.save(user);
//				System.out.println("✔ Utilizatorul 'admin' a fost creat.");
//			} else {
//				System.out.println("ℹ Utilizatorul 'admin' există deja.");
//			}
//		};
//	}
}
