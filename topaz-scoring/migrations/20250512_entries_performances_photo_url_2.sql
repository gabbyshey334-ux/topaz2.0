-- Optional second headshot for duo entries (and performances mirror).
ALTER TABLE entries ADD COLUMN IF NOT EXISTS photo_url_2 TEXT;
ALTER TABLE performances ADD COLUMN IF NOT EXISTS photo_url_2 TEXT;
