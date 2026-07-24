ALTER TABLE tenants ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE tenants ADD COLUMN subscription_id VARCHAR(255);
ALTER TABLE tenants ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'incomplete';
ALTER TABLE tenants ADD COLUMN trial_ends_at TIMESTAMP;
ALTER TABLE tenants ADD COLUMN subscription_ends_at TIMESTAMP;
