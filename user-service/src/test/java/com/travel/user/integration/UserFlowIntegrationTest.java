package com.travel.user.integration;

import com.travel.user.dto.AuthResponse;
import com.travel.user.dto.LoginRequest;
import com.travel.user.dto.RegisterRequest;
import com.travel.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UserFlowIntegrationTest {

    @Autowired
    private TestRestTemplate rest;

    @Autowired
    private UserRepository userRepository;

    private final UUID tenantId = UUID.randomUUID();

    @Test
    void fullUserManagementFlow() {
        // 1. Register two users under the same tenant
        String token1 = registerUser("alice@test.com", tenantId);
        String token2 = registerUser("bob@test.com", tenantId);

        assertThat(token1).isNotBlank();
        assertThat(token2).isNotBlank();

        // 2. Get all tenant users (admin endpoint)
        List<Map<String, Object>> users = getTenantUsers(token1, tenantId);
        assertThat(users).hasSize(2);

        String aliceId = null;
        String bobId = null;
        for (Map<String, Object> u : users) {
            if ("alice@test.com".equals(u.get("email"))) {
                aliceId = (String) u.get("id");
            }
            if ("bob@test.com".equals(u.get("email"))) {
                bobId = (String) u.get("id");
            }
        }
        assertThat(aliceId).isNotNull();
        assertThat(bobId).isNotNull();

        // 3. Delete bob via admin endpoint
        ResponseEntity<Void> deleteResp = deleteUser(token1, tenantId, bobId);
        assertThat(deleteResp.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        // 4. Verify bob is gone from the DB
        assertThat(userRepository.findById(UUID.fromString(bobId))).isEmpty();
        assertThat(userRepository.findById(UUID.fromString(aliceId))).isPresent();

        // 5. Get tenant users again — should have only 1
        List<Map<String, Object>> remaining = getTenantUsers(token1, tenantId);
        assertThat(remaining).hasSize(1);
        assertThat(remaining.get(0).get("email")).isEqualTo("alice@test.com");

        // 6. Delete alice as well
        ResponseEntity<Void> deleteAlice = deleteUser(token1, tenantId, aliceId);
        assertThat(deleteAlice.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        // 7. Verify tenant is empty
        assertThat(userRepository.findByTenantId(tenantId)).isEmpty();
    }

    @Test
    void deleteUser_wrongTenant_returns403() {
        String token = registerUser("charlie@test.com", tenantId);

        List<Map<String, Object>> users = getTenantUsers(token, tenantId);
        String charlieId = (String) users.get(0).get("id");

        UUID wrongTenantId = UUID.randomUUID();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.set("X-Tenant-Id", wrongTenantId.toString());

        ResponseEntity<Void> resp = rest.exchange(
                "/api/user/admin/{id}",
                HttpMethod.DELETE,
                new HttpEntity<>(headers),
                Void.class,
                charlieId
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(userRepository.findById(UUID.fromString(charlieId))).isPresent();
    }

    @Test
    void deleteUser_notFound_returns404() {
        String token = registerUser("dave@test.com", tenantId);
        UUID fakeId = UUID.randomUUID();

        ResponseEntity<Void> resp = deleteUser(token, tenantId, fakeId.toString());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getTenantUsers_anotherTenant_returnsEmpty() {
        String token = registerUser("eve@test.com", tenantId);

        UUID otherTenant = UUID.randomUUID();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.set("X-Tenant-Id", otherTenant.toString());

        ResponseEntity<List> resp = rest.exchange(
                "/api/user/admin/users",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                List.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isEmpty();
    }

    // --- helpers ---

    private String registerUser(String email, UUID tenantId) {
        RegisterRequest req = new RegisterRequest();
        req.setName(email.split("@")[0]);
        req.setEmail(email);
        req.setPassword("password123");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Tenant-Id", tenantId.toString());

        ResponseEntity<AuthResponse> resp = rest.exchange(
                "/api/auth/register",
                HttpMethod.POST,
                new HttpEntity<>(req, headers),
                AuthResponse.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return resp.getBody().getToken();
    }

    private List<Map<String, Object>> getTenantUsers(String token, UUID tenantId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.set("X-Tenant-Id", tenantId.toString());

        ResponseEntity<List> resp = rest.exchange(
                "/api/user/admin/users",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                List.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        return resp.getBody();
    }

    private ResponseEntity<Void> deleteUser(String token, UUID tenantId, String userId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.set("X-Tenant-Id", tenantId.toString());
        return rest.exchange(
                "/api/user/admin/{id}",
                HttpMethod.DELETE,
                new HttpEntity<>(headers),
                Void.class,
                userId
        );
    }
}
