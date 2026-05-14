package com.jobtracker.backend.service;

import com.jobtracker.backend.entity.User;
import com.jobtracker.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean authenticate(User user) {

        Optional<User> existingUser =
                userRepository.findByUsername(user.getUsername());

        System.out.println("User found: " + existingUser.isPresent());

        if (existingUser.isPresent()) {
            System.out.println("DB Password: " + existingUser.get().getPassword());
            System.out.println("Entered Password: " + user.getPassword());
        }

        return existingUser.isPresent() &&
                existingUser.get().getPassword().equals(user.getPassword());
    }
}
