package com.jobtracker.backend.config;

import com.jobtracker.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {

            String authHeader = request.getHeader("Authorization");

            String token = null;
            String username = null;

            // ✅ 1. Extract token
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }

            // ❌ 2. Validate token safely
            if (token != null && JwtUtil.validateToken(token)) {
                username = JwtUtil.extractUsername(token);
            }

            // ✅ 3. Set authentication only if not already set
            if (username != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                new ArrayList<>() // roles empty for now
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

        } catch (Exception e) {
            System.out.println("JWT Filter Error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}