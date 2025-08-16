import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo admin user
  const hashedPassword = await hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  // Create demo villa owner
  const ownerPassword = await hash('owner123', 12)
  
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'Villa Owner',
      password: ownerPassword,
      role: 'VILLA_OWNER'
    }
  })

  // Create demo villa
  const amenitiesData = ['Pool', 'WiFi', 'Air Conditioning', 'Beach Access', 'Parking', 'Kitchen']
  const imagesData = ['https://images.unsplash.com/photo-1571896349842-33c89424de2d']
  
  const villa = await prisma.villa.create({
    data: {
      name: 'Sunset Beach Villa',
      description: 'Beautiful beachfront villa with stunning sunset views. Perfect for family vacations.',
      location: 'Goa',
      address: 'Sunset Beach Road, Candolim, Goa 403515',
      maxGuests: 8,
      bedrooms: 4,
      bathrooms: 3,
      amenities: amenitiesData,  // Direct JSON array for PostgreSQL
      images: imagesData,        // Direct JSON array for PostgreSQL
      pricePerNight: 5000,
      ownerId: owner.id,
      isApproved: true,
      isActive: true
    }
  })

  console.log('Demo data created successfully!')
  console.log('Admin user: admin@example.com / admin123')
  console.log('Villa owner: owner@example.com / owner123')
  console.log('Demo villa:', villa.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
