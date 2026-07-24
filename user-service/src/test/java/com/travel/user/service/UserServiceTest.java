package com.travel.user.service;

import com.travel.user.config.TenantContext;
import com.travel.user.dto.ProfileResponse;
import com.travel.user.entity.User;
import com.travel.user.exception.ResourceNotFoundException;
import com.travel.user.exception.UnauthorizedException;
import com.travel.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private final UUID tenantId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    private User testUser;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(tenantId);
        testUser = new User();
        testUser.setId(userId);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encoded-password");
        testUser.setTenantId(tenantId);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // --- getTenantUsers ---

    @Test
    void getTenantUsers_returnsUsersForTenant() {
        User user2 = new User();
        user2.setId(UUID.randomUUID());
        user2.setName("User 2");
        user2.setEmail("user2@example.com");
        user2.setTenantId(tenantId);
        when(userRepository.findByTenantId(tenantId)).thenReturn(List.of(testUser, user2));

        List<ProfileResponse> result = userService.getTenantUsers(tenantId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(userId);
        assertThat(result.get(0).getName()).isEqualTo("Test User");
        assertThat(result.get(0).getEmail()).isEqualTo("test@example.com");
        assertThat(result.get(0).getTenantId()).isEqualTo(tenantId);
        verify(userRepository).findByTenantId(tenantId);
    }

    @Test
    void getTenantUsers_returnsEmptyList_whenNoUsers() {
        when(userRepository.findByTenantId(tenantId)).thenReturn(List.of());

        List<ProfileResponse> result = userService.getTenantUsers(tenantId);

        assertThat(result).isEmpty();
        verify(userRepository).findByTenantId(tenantId);
    }

    // --- deleteUser ---

    @Test
    void deleteUser_deletesUserInSameTenant() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        userService.deleteUser(userId);

        verify(userRepository).delete(testUser);
    }

    @Test
    void deleteUser_throws_whenTargetNotFound() {
        UUID missingId = UUID.randomUUID();
        when(userRepository.findById(missingId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteUser(missingId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");
        verify(userRepository, never()).delete(any());
    }

    @Test
    void deleteUser_throws_whenTargetBelongsToDifferentTenant() {
        UUID otherTenantId = UUID.randomUUID();
        testUser.setTenantId(otherTenantId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> userService.deleteUser(userId))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("User does not belong to this tenant");
        verify(userRepository, never()).delete(any());
    }

    @Test
    void deleteUser_throws_whenNoTenantContext() {
        TenantContext.clear();

        assertThatThrownBy(() -> userService.deleteUser(userId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Tenant context is required");
        verify(userRepository, never()).delete(any());
    }
}
