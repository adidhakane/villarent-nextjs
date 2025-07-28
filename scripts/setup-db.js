const { execSync } = require('child_process');

console.log('🔧 Setting up database...');

// Check if we're in production
if (process.env.NODE_ENV === 'production') {
    console.log('📦 Production environment detected - using PostgreSQL');
    console.log('🔄 Generating Prisma client for PostgreSQL...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('🚀 Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
} else {
    console.log('🏠 Development environment detected - using SQLite');
    console.log('🔄 Generating Prisma client for SQLite...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('🔄 Pushing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('🌱 Seeding database with demo data...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
}

console.log('✅ Database setup complete!');
