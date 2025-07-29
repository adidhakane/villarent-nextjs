// Test script to register a villa with valid data
const fetch = require('node-fetch');

async function testVillaRegistration() {
  try {
    // First, get a session cookie by logging in
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'owner@example.com',
        password: 'password123',
        csrfToken: 'test'
      })
    });

    console.log('Login response:', loginResponse.status);

    // Create form data for villa registration
    const formData = new FormData();
    
    // Add all required fields with valid data
    formData.append('name', 'Beautiful Beachside Villa');
    formData.append('description', 'A stunning villa with amazing ocean views and modern amenities perfect for family vacations');
    formData.append('location', 'Goa');
    formData.append('address', '123 Beach Road, Calangute, Goa 403516, India');
    formData.append('maxGuests', '8');
    formData.append('bedrooms', '4');
    formData.append('bathrooms', '3');
    formData.append('pricePerNight', '5000');
    formData.append('ownerPhone', '9876543210');
    formData.append('ownerEmail', 'owner@example.com');
    formData.append('weekdayPrice', '4000');
    formData.append('fridayPrice', '5000');
    formData.append('saturdayPrice', '6000');
    formData.append('sundayPrice', '5500');
    formData.append('checkInTime', '14:00');
    formData.append('checkOutTime', '11:00');
    
    // Add amenities as JSON string with valid amenities
    formData.append('amenities', JSON.stringify(['Swimming Pool', 'WiFi', 'Air Conditioning', 'Kitchen']));

    // Register villa
    const response = await fetch('http://localhost:3000/api/villas/register', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    console.log('Villa registration response:', {
      status: response.status,
      result: result
    });

    if (response.ok) {
      console.log('✅ Villa registered successfully!');
    } else {
      console.log('❌ Villa registration failed:', result);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testVillaRegistration();
