CREATE TABLE admin_destinations (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    estimated_cost DECIMAL(10,2) NOT NULL,
    travel_types TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_destinations_tenant ON admin_destinations(tenant_id);
