CREATE TABLE super_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO super_admins (email, password, name) VALUES
    ('admin@travelplanner.com', '$2b$10$.sOHRxF00kTddPPvtFEwkeZcBuEAIBK.EXUmiro6EVDtEjtL.zQE2', 'Super Admin')
ON CONFLICT (email) DO NOTHING;
