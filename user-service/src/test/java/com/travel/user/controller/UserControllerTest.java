package com.travel.user.controller;

import com.travel.user.dto.ProfileResponse;
import com.travel.user.exception.GlobalExceptionHandler;
import com.travel.user.exception.ResourceNotFoundException;
import com.travel.user.exception.UnauthorizedException;
import com.travel.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    private MockMvc mockMvc;

    private final UUID tenantId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        var controller = new UserController(userService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getTenantUsers_returnsUsers() throws Exception {
        ProfileResponse user1 = new ProfileResponse(userId, "User 1", "user1@test.com", null, tenantId);
        ProfileResponse user2 = new ProfileResponse(UUID.randomUUID(), "User 2", "user2@test.com", null, tenantId);
        when(userService.getTenantUsers(tenantId)).thenReturn(List.of(user1, user2));

        mockMvc.perform(get("/api/user/admin/users")
                        .header("X-Tenant-Id", tenantId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(userId.toString()))
                .andExpect(jsonPath("$[0].name").value("User 1"))
                .andExpect(jsonPath("$[0].email").value("user1@test.com"));

        verify(userService).getTenantUsers(tenantId);
    }

    @Test
    void getTenantUsers_returnsEmptyArray_whenNone() throws Exception {
        when(userService.getTenantUsers(tenantId)).thenReturn(List.of());

        mockMvc.perform(get("/api/user/admin/users")
                        .header("X-Tenant-Id", tenantId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void deleteUser_returns204() throws Exception {
        doNothing().when(userService).deleteUser(userId);

        mockMvc.perform(delete("/api/user/admin/{userId}", userId))
                .andExpect(status().isNoContent());

        verify(userService).deleteUser(userId);
    }

    @Test
    void deleteUser_returns404_whenNotFound() throws Exception {
        UUID missingId = UUID.randomUUID();
        doThrow(new ResourceNotFoundException("User not found"))
                .when(userService).deleteUser(missingId);

        mockMvc.perform(delete("/api/user/admin/{userId}", missingId))
                .andExpect(status().isNotFound());

        verify(userService).deleteUser(missingId);
    }

    @Test
    void deleteUser_returns403_whenTenantMismatch() throws Exception {
        doThrow(new UnauthorizedException("User does not belong to this tenant"))
                .when(userService).deleteUser(userId);

        mockMvc.perform(delete("/api/user/admin/{userId}", userId))
                .andExpect(status().isForbidden());

        verify(userService).deleteUser(userId);
    }
}
