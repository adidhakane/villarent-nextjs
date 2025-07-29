const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkVillas() {
  try {
    console.log('Checking villas in database...')
    
    // Check total villas
    const totalVillas = await prisma.villa.count()
    console.log(`Total villas: ${totalVillas}`)
    
    // Get all villas with basic info
    const villas = await prisma.villa.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        isApproved: true,
        isActive: true,
        maxGuests: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log('\nVillas in database:')
    villas.forEach(villa => {
      console.log(`- ${villa.name} (${villa.location}) - Approved: ${villa.isApproved}, Active: ${villa.isActive}, Max Guests: ${villa.maxGuests}`)
      console.log(`  Owner: ${villa.owner.name} (${villa.owner.email})`)
    })
    
    // Test search query
    console.log('\nTesting search for location "Goa" with 2 guests...')
    const searchResult = await prisma.villa.findMany({
      where: {
        location: {
          contains: 'Goa'
        },
        maxGuests: {
          gte: 2
        },
        isApproved: true,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        location: true,
        maxGuests: true
      }
    })
    
    console.log(`Found ${searchResult.length} villas matching search criteria:`)
    searchResult.forEach(villa => {
      console.log(`- ${villa.name} (${villa.location}) - Max Guests: ${villa.maxGuests}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVillas()
