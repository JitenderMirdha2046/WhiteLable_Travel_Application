CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    subdomain VARCHAR(100) UNIQUE,
    logo_url VARCHAR(500),
    primary_color VARCHAR(20) DEFAULT '#3b82f6',
    accent_color VARCHAR(20) DEFAULT '#a855f7',
    tagline VARCHAR(200),
    plan_type VARCHAR(20) DEFAULT 'starter',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
