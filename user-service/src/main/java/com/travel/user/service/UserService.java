package com.travel.user.service;

import com.travel.user.config.TenantContext;
import com.travel.user.dto.AuthResponse;
import com.travel.user.dto.LoginRequest;
import com.travel.user.dto.RegisterRequest;
import com.travel.user.entity.User;
import com.travel.user.exception.DuplicateResourceException;
import com.travel.user.exception.ResourceNotFoundException;
import com.travel.user.exception.UnauthorizedException;
import com.travel.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        UUID tenantId = request.getTenantId() != null
                ? request.getTenantId()
                : TenantContext.getTenantId();

        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant ID is required for registration");
        }

        if (userRepository.existsByEmailAndTenantId(request.getEmail(), tenantId)) {
            throw new DuplicateResourceException("Email already registered in this tenant");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setTenantId(tenantId);

        userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getName(), user.getTenantId());
        return new AuthResponse(token, user.getTenantId());
    }

    public AuthResponse login(LoginRequest request) {
        UUID tenantId = TenantContext.getTenantId();

        User user = tenantId != null
                ? userRepository.findByEmailAndTenantId(request.getEmail(), tenantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"))
                : userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getName(), user.getTenantId());
        return new AuthResponse(token, user.getTenantId());
    }
}
