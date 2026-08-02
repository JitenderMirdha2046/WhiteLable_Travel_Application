CREATE TABLE admin_places (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    destination_id UUID NOT NULL REFERENCES admin_destinations(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    time_required DECIMAL(5,1) NOT NULL DEFAULT 2.0,
    entry_cost DECIMAL(10,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_places_tenant ON admin_places(tenant_id);
CREATE INDEX idx_admin_places_destination ON admin_places(destination_id);
