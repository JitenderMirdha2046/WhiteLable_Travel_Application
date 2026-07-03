CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    destination VARCHAR(100) NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    days INTEGER NOT NULL,
    travel_type VARCHAR(50) NOT NULL,
    mood_description TEXT,
    trip_status VARCHAR(30),
    weather_summary TEXT,
    cache_used BOOLEAN,
    total_estimated_cost DECIMAL(10,2),
    itinerary TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_budget (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL,
    hotel_cost DECIMAL(10,2),
    food_cost DECIMAL(10,2),
    transport_cost DECIMAL(10,2),
    activity_cost DECIMAL(10,2),
    misc_cost DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS trip_comparison (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    destination VARCHAR(100) NOT NULL,
    comparison_type VARCHAR(50) NOT NULL,
    itinerary TEXT
);

CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_budget_trip ON trip_budget(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_comparison_user ON trip_comparison(user_id);
