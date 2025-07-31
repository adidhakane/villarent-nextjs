import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

export async function initializeDatabase() {
  try {
    console.log('🔍 Checking if database needs initialization...')
    
    // Check if admin user exists
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })

    console.log('👤 Admin user exists:', adminExists ? 'YES ✅' : 'NO ❌')

    if (!adminExists) {
      console.log('🚀 Initializing database with demo data...')
      
      // Create demo admin user
      const hashedPassword = await hash('admin123', 12)
      console.log('🔐 Admin password hashed:', hashedPassword.substring(0, 10) + '...')
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN'
        }
      })

      console.log('✅ Admin user created:', admin.email)

      // Create demo villa owner
      const ownerPassword = await hash('owner123', 12)
      console.log('🔐 Owner password hashed:', ownerPassword.substring(0, 10) + '...')
      
      const owner = await prisma.user.create({
        data: {
          email: 'owner@example.com',
          name: 'Villa Owner',
          password: ownerPassword,
          role: 'VILLA_OWNER'
        }
      })

      console.log('✅ Villa owner created:', owner.email)

      // Create demo villa
      await prisma.villa.create({
        data: {
          name: 'Sunset Beach Villa',
          description: 'Beautiful beachfront villa with stunning sunset views. Perfect for family vacations.',
          location: 'Goa',
          address: 'Sunset Beach Road, Candolim, Goa 403515',
          maxGuests: 8,
          bedrooms: 4,
          bathrooms: 3,
          amenities: JSON.stringify(['Pool', 'WiFi', 'Air Conditioning', 'Beach Access', 'Parking', 'Kitchen']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1571896349842-33c89424de2d']),
          pricePerNight: 5000,
          ownerId: owner.id,
          isApproved: true,
          isActive: true
        }
      })

      console.log('Demo data created successfully!')
      console.log('Admin user: admin@example.com / admin123')
      console.log('Villa owner: owner@example.com / owner123')
    }
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}
