-- Production Database Setup Script
-- Run this manually in your Prisma Postgres database console

-- First, let's check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- If no tables exist, you need to run: npx prisma db push
-- Then run: npx prisma db seed

-- Check if demo data exists
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as villa_count FROM villas;

-- If counts are 0, the database needs seeding
