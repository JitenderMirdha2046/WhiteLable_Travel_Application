ALTER TABLE admin_destinations ADD COLUMN active_start_hour INT DEFAULT 7;
ALTER TABLE admin_destinations ADD COLUMN active_end_hour INT DEFAULT 18;
