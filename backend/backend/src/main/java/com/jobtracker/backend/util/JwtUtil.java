package com.jobtracker.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;

public class JwtUtil {

    private static final String SECRET =
            "myverysecuresecretkeyforjwtgeneration123456789";

    // ================= GENERATE TOKEN =================
    public static String generateToken(String username) {

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hour
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }

    // ================= EXTRACT USERNAME =================
    public static String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // ================= VALIDATE TOKEN =================
    public static boolean validateToken(String token) {
        return getClaims(token).getExpiration().after(new Date());
    }

    // ================= GET CLAIMS =================
    private static Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody();
    }
}