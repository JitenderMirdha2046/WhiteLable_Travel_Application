package com.travel.gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TenantGatewayFilterFactory extends AbstractGatewayFilterFactory<TenantGatewayFilterFactory.Config> {

    private static final Logger log = LoggerFactory.getLogger(TenantGatewayFilterFactory.class);

    public TenantGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            var request = exchange.getRequest();
            var headers = request.getHeaders();
            var builder = request.mutate();

            String tenantId = headers.getFirst("X-Tenant-Id");

            if (tenantId != null && !tenantId.isBlank()) {
                log.debug("Tenant ID already set: {}", tenantId);
                return chain.filter(exchange);
            }

            String domain = headers.getFirst("X-Tenant-Domain");
            if (domain != null && !domain.isBlank()) {
                builder.header("X-Tenant-Domain", domain);
                log.debug("Tenant domain header: {}", domain);
            }

            String host = headers.getFirst("Host");
            if (host != null && !host.isBlank()) {
                String subdomain = extractSubdomain(host);
                if (subdomain != null) {
                    builder.header("X-Tenant-Subdomain", subdomain);
                    log.debug("Extracted subdomain: {} from host: {}", subdomain, host);
                }
            }

            List<String> tenantParam = request.getQueryParams().get("tenant");
            if (tenantParam != null && !tenantParam.isEmpty()) {
                builder.header("X-Tenant-Subdomain", tenantParam.get(0));
                log.debug("Tenant from query param: {}", tenantParam.get(0));
            }

            exchange = exchange.mutate()
                    .request(builder.build())
                    .build();

            return chain.filter(exchange);
        };
    }

    private String extractSubdomain(String host) {
        String hostWithoutPort = host.contains(":")
                ? host.substring(0, host.indexOf(':'))
                : host;

        String[] parts = hostWithoutPort.split("\\.");
        if (parts.length >= 3) {
            return parts[0];
        }
        return null;
    }

    public static class Config {}
}
