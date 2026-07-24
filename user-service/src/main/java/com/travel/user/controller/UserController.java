package com.travel.user.controller;

import com.travel.user.dto.AuthResponse;
import com.travel.user.dto.ProfileResponse;
import com.travel.user.dto.ProfileUpdateRequest;
import com.travel.user.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuthResponse> uploadAvatar(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.uploadAvatar(userId, file));
    }

    @GetMapping("/admin/users")
    public ResponseEntity<List<ProfileResponse>> getTenantUsers(@RequestHeader("X-Tenant-Id") UUID tenantId) {
        return ResponseEntity.ok(userService.getTenantUsers(tenantId));
    }

    @DeleteMapping("/admin/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
