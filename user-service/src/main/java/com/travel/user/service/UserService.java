package com.travel.user.service;

import com.travel.user.config.TenantContext;
import com.travel.user.dto.AuthResponse;
import com.travel.user.dto.LoginRequest;
import com.travel.user.dto.ProfileResponse;
import com.travel.user.dto.ProfileUpdateRequest;
import com.travel.user.dto.RegisterRequest;
import com.travel.user.entity.User;
import com.travel.user.exception.DuplicateResourceException;
import com.travel.user.exception.ResourceNotFoundException;
import com.travel.user.exception.UnauthorizedException;
import com.travel.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String uploadDir;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       @Value("${app.upload.dir:uploads/avatars}") String uploadDir) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.uploadDir = uploadDir;
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

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getName(), user.getTenantId(), user.getAvatarUrl());
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

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getName(), user.getTenantId(), user.getAvatarUrl());
        return new AuthResponse(token, user.getTenantId());
    }

    public ProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UUID currentTenantId = TenantContext.getTenantId();
        if (currentTenantId != null && !user.getTenantId().equals(currentTenantId)) {
            throw new UnauthorizedException("Tenant mismatch");
        }
        return new ProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getAvatarUrl(), user.getTenantId());
    }

    public AuthResponse updateProfile(UUID userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UUID currentTenantId = TenantContext.getTenantId();
        if (currentTenantId != null && !user.getTenantId().equals(currentTenantId)) {
            throw new UnauthorizedException("Tenant mismatch");
        }

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getName(), user.getTenantId(), user.getAvatarUrl());
        return new AuthResponse(token, user.getTenantId());
    }

    public AuthResponse uploadAvatar(UUID userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UUID currentTenantId = TenantContext.getTenantId();
        if (currentTenantId != null && !user.getTenantId().equals(currentTenantId)) {
            throw new UnauthorizedException("Tenant mismatch");
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            file.transferTo(filePath.toFile());

            user.setAvatarUrl("/uploads/avatars/" + filename);
            userRepository.save(user);

            String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getName(), user.getTenantId(), user.getAvatarUrl());
            return new AuthResponse(token, user.getTenantId());
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload avatar", e);
        }
    }

    public List<ProfileResponse> getTenantUsers(UUID tenantId) {
        return userRepository.findByTenantId(tenantId).stream()
                .map(u -> new ProfileResponse(u.getId(), u.getName(), u.getEmail(), u.getAvatarUrl(), u.getTenantId()))
                .toList();
    }

    public void deleteUser(UUID targetUserId) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant context is required");
        }
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!target.getTenantId().equals(tenantId)) {
            throw new com.travel.user.exception.UnauthorizedException("User does not belong to this tenant");
        }
        userRepository.delete(target);
    }
}
