package com.jobtracker.backend.controller;

import com.jobtracker.backend.entity.User;
import com.jobtracker.backend.repository.UserRepository;
import com.jobtracker.backend.service.AuthService;
import com.jobtracker.backend.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public String register(@RequestBody User user) {

        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());

        if (existingUser.isPresent()) {
            return "User already exists";
        }

        userRepository.save(user);
        return "Registration Successful";
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {

        System.out.println("Username: " + user.getUsername());
        System.out.println("Password: " + user.getPassword());

        if (authService.authenticate(user)) {
            System.out.println("Auth success");

            String token = JwtUtil.generateToken(user.getUsername());

            System.out.println("Token generated");

            return token;
        }

        System.out.println("Invalid credentials");
        return "Invalid Credentials";
    }
}