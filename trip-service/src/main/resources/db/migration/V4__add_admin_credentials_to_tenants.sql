ALTER TABLE tenants ADD COLUMN IF NOT EXISTS admin_email VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS admin_password VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_tenants_admin_email ON tenants(admin_email);
