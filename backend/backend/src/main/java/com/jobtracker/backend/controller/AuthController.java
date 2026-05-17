package com.jobtracker.backend.controller;

import com.jobtracker.backend.entity.User;
import com.jobtracker.backend.repository.UserRepository;
import com.jobtracker.backend.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository,
                          BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody User user) {

        if (user.getUsername() == null || user.getPassword() == null) {
            return Map.of("error", "Username and password required");
        }

        Optional<User> existingUser =
                userRepository.findByUsername(user.getUsername());

        if (existingUser.isPresent()) {
            return Map.of("message", "User already exists");
        }

        // 🔥 Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);

        return Map.of("message", "Registration Successful");
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User user) {

        Optional<User> dbUser =
                userRepository.findByUsername(user.getUsername());

        if (dbUser.isEmpty()) {
            return Map.of("error", "Invalid Credentials");
        }

        boolean passwordMatch = passwordEncoder.matches(
                user.getPassword(),
                dbUser.get().getPassword()
        );

        if (!passwordMatch) {
            return Map.of("error", "Invalid Credentials");
        }

        String token = JwtUtil.generateToken(dbUser.get().getUsername());

        return Map.of(
                "token", token,
                "username", dbUser.get().getUsername()
        );
    }
}