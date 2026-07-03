package com.travel.gateway.config;

import com.travel.gateway.util.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Component
public class AuthGatewayFilterFactory extends AbstractGatewayFilterFactory<AuthGatewayFilterFactory.Config> {

    private final JwtUtil jwtUtil;

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/register",
            "/api/auth/login"
    );

    public AuthGatewayFilterFactory(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();

            if (PUBLIC_PATHS.contains(path)) {
                return chain.filter(exchange);
            }

            String authHeader = exchange.getRequest().getHeaders()
                    .getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid token");
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.isValid(token)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
            }

            String userId = jwtUtil.extractUserId(token);
            String tenantId = jwtUtil.extractTenantId(token);

            var requestBuilder = exchange.getRequest().mutate()
                    .header("X-User-Id", userId);

            if (tenantId != null && !tenantId.isBlank()) {
                requestBuilder.header("X-Tenant-Id", tenantId);
            }

            exchange = exchange.mutate()
                    .request(requestBuilder.build())
                    .build();

            return chain.filter(exchange);
        };
    }

    public static class Config {}
}
