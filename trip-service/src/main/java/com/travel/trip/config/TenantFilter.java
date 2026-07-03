package com.travel.trip.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(1)
public class TenantFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(TenantFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        try {
            String tenantId = httpRequest.getHeader("X-Tenant-Id");
            if (tenantId != null && !tenantId.isBlank()) {
                TenantContext.setTenantId(UUID.fromString(tenantId));
                log.debug("Tenant context set to: {}", tenantId);
            }

            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
