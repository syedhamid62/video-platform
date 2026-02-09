package com.videosharing.config;

import com.videosharing.model.entity.User;
import com.videosharing.repository.UserRepository;
import com.videosharing.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        System.out.println("JWT FILTER: Header: " + authHeader);

        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtUtil.getEmailFromToken(token);
                System.out.println("JWT FILTER: Email extracted: " + email);
            } catch (Exception e) {
                System.out.println("JWT FILTER: Token extraction failed: " + e.getMessage());
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            User user = userRepository.findByEmail(email).orElse(null);
            System.out.println("JWT FILTER: User found in DB: " + (user != null));

            if (user != null && jwtUtil.validateToken(token)) {
                System.out.println("JWT FILTER: Token VALID. Setting Auth for user: " + user.getEmail() + " (Role: "
                        + user.getRole() + ")");
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        user.getAuthorities());

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                if (user == null)
                    System.out.println("JWT FILTER: USER NOT FOUND in DB for email: " + email);
                if (!jwtUtil.validateToken(token))
                    System.out.println("JWT FILTER: Token VALIDATION FAILED (Expired or Malformed)");
            }
        }

        filterChain.doFilter(request, response);
    }
}
