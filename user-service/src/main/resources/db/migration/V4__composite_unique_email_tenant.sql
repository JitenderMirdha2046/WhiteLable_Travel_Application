ALTER TABLE users DROP CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7;
ALTER TABLE users ADD CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email);
