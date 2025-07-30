// Switch Prisma schema based on environment
const fs = require('fs');
const path = require('path');

console.log('🔄 Setting up Prisma schema for environment:', process.env.NODE_ENV);

const schemaSource = process.env.NODE_ENV === 'production' 
  ? 'schema.prod.prisma' 
  : 'schema.dev.prisma';

const sourcePath = path.join(__dirname, '..', 'prisma', schemaSource);
const targetPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

if (fs.existsSync(sourcePath)) {
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✅ Copied ${schemaSource} to schema.prisma`);
} else {
  console.log(`⚠️  ${schemaSource} not found, keeping existing schema.prisma`);
}

console.log('✅ Prisma schema setup complete');
