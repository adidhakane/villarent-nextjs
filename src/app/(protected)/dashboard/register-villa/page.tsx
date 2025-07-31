'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { POPULAR_LOCATIONS, VILLA_AMENITIES } from '@/lib/validations'

export default function RegisterVillaPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: 1000,
    amenities: [] as string[],
    // New fields
    ownerPhone: '',
    ownerEmail: '',
    weekdayPrice: 1000,
    fridayPrice: 1200,
    saturdayPrice: 1500,
    sundayPrice: 1500,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    // Admin fields (only visible to admin)
    adminWeekdayPrice: undefined,
    adminSaturdayPrice: undefined,
    adminSundayPrice: undefined,
    googleDriveLink: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setValidationErrors({})

    try {
      // Create FormData to handle file upload
      const formDataToSend = new FormData()
      
      // Add all form fields, but skip empty admin fields
      Object.entries(formData).forEach(([key, value]) => {
        // Skip admin fields that are undefined or empty
        if (key.startsWith('admin') && (value === undefined || value === null || value === '')) {
          return
        }
        // Skip empty Google Drive link
        if (key === 'googleDriveLink' && (value === '' || value === null || value === undefined)) {
          return
        }
        
        if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value.toString())
        }
      })
      
      // Add amenities as JSON string with a different key to avoid conflicts
      formDataToSend.append('amenitiesJson', JSON.stringify(formData.amenities))
      
      // Add cover image if selected
      if (selectedImage) {
        formDataToSend.append('coverImage', selectedImage)
      }

      const response = await fetch('/api/villas/register', {
        method: 'POST',
        body: formDataToSend // Don't set Content-Type, let browser handle it for FormData
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard?message=Villa registered successfully! Awaiting approval.')
      } else {
        // Handle validation errors
        if (data.validation) {
          setValidationErrors(data.validation)
          setError('Please fix the validation errors below.')
        } else {
          setError(data.error || 'Failed to register villa')
        }
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? 
        (value === '' ? 
          (name.startsWith('admin') ? undefined : '') : // Admin fields become undefined when empty
          parseInt(value) || 0
        ) : value
    }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => {
      const newAmenities = checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
      return {
        ...prev,
        amenities: newAmenities
      }
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({ ...prev, coverImage: 'Image size must be less than 5MB' }))
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({ ...prev, coverImage: 'Please select a valid image file' }))
        return
      }
      
      setSelectedImage(file)
      setValidationErrors(prev => ({ ...prev, coverImage: '' }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Helper function to display field errors
  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName] ? (
      <p className="text-sm text-red-500 mt-1">{validationErrors[fieldName]}</p>
    ) : null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </Link>
              <Home className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Register New Villa</h1>
            </div>
            <span className="text-sm text-gray-700">Welcome, {session?.user?.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Villa Details</CardTitle>
            <CardDescription>
              Provide detailed information about your villa. Your listing will be reviewed by our team before going live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Villa Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-600 flex items-center">
                  🏠 Villa Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Villa Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter villa name"
                      className={validationErrors.name ? 'border-red-500' : ''}
                    />
                    {getFieldError('name')}
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                      <SelectTrigger className={validationErrors.location ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Enter location" />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_LOCATIONS.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getFieldError('location')}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-600 flex items-center">
                  📞 Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="ownerPhone">Phone Number *</Label>
                    <Input
                      id="ownerPhone"
                      name="ownerPhone"
                      required
                      value={formData.ownerPhone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 9876543210"
                      className={validationErrors.ownerPhone ? 'border-red-500' : ''}
                    />
                    {getFieldError('ownerPhone')}
                  </div>

                  <div>
                    <Label htmlFor="ownerEmail">Email Address *</Label>
                    <Input
                      id="ownerEmail"
                      name="ownerEmail"
                      type="email"
                      required
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      placeholder="e.g. owner@example.com"
                      className={validationErrors.ownerEmail ? 'border-red-500' : ''}
                    />
                    {getFieldError('ownerEmail')}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-yellow-600 flex items-center">
                  💰 Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <Label htmlFor="weekdayPrice">Weekday Price (₹) *</Label>
                    <Input
                      id="weekdayPrice"
                      name="weekdayPrice"
                      type="number"
                      min="100"
                      required
                      value={formData.weekdayPrice}
                      onChange={handleInputChange}
                      placeholder="Enter Mon-Thu price"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fridayPrice">Friday Price (₹) *</Label>
                    <Input
                      id="fridayPrice"
                      name="fridayPrice"
                      type="number"
                      min="100"
                      required
                      value={formData.fridayPrice}
                      onChange={handleInputChange}
                      placeholder="Enter Friday price"
                    />
                  </div>

                  <div>
                    <Label htmlFor="saturdayPrice">Saturday Price (₹) *</Label>
                    <Input
                      id="saturdayPrice"
                      name="saturdayPrice"
                      type="number"
                      min="100"
                      required
                      value={formData.saturdayPrice}
                      onChange={handleInputChange}
                      placeholder="Enter Saturday price"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sundayPrice">Sunday Price (₹) *</Label>
                    <Input
                      id="sundayPrice"
                      name="sundayPrice"
                      type="number"
                      min="100"
                      required
                      value={formData.sundayPrice}
                      onChange={handleInputChange}
                      placeholder="Enter Sunday price"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your villa, its features, and what makes it special..."
                />
              </div>

              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Complete address with landmarks"
                />
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="maxGuests">Max Guests *</Label>
                  <Input
                    id="maxGuests"
                    name="maxGuests"
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.maxGuests}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="pricePerNight">Base Price per Night (₹) *</Label>
                  <Input
                    id="pricePerNight"
                    name="pricePerNight"
                    type="number"
                    min="100"
                    required
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600 flex items-center">
                  🏊 Amenities *
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {VILLA_AMENITIES.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor={amenity} className="text-sm font-normal">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
                {getFieldError('amenities')}
              </div>

              {/* Check-in / Check-out */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-600 flex items-center">
                  🕐 Check-In / Check-Out
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="checkInTime">Check-In Time *</Label>
                    <Input
                      id="checkInTime"
                      name="checkInTime"
                      type="time"
                      required
                      value={formData.checkInTime}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="checkOutTime">Check-Out Time *</Label>
                    <Input
                      id="checkOutTime"
                      name="checkOutTime"
                      type="time"
                      required
                      value={formData.checkOutTime}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600 flex items-center">
                  🖼️ Cover Image
                </h3>
                <div>
                  <Label htmlFor="coverImage">Attach One Image *</Label>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="mx-auto h-32 w-32 object-cover rounded-md"
                          />
                          <p className="text-sm text-gray-600">{selectedImage?.name}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImage(null)
                              setImagePreview(null)
                              const input = document.getElementById('coverImage') as HTMLInputElement
                              if (input) input.value = ''
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="coverImage" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Choose File</span>
                            <input 
                              id="coverImage" 
                              name="coverImage" 
                              type="file" 
                              className="sr-only" 
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">No file chosen</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {validationErrors.coverImage && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.coverImage}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                  </p>
                  <p className="text-sm text-red-500 mt-2">
                    Note: Our team will contact you to get other images and will upload them from our side after editing.
                  </p>
                </div>
              </div>

              {/* Admin Settings (Only visible to admins) */}
              {session?.user?.role === 'ADMIN' && (
                <div className="space-y-4 border-2 border-red-200 rounded-lg p-6 bg-red-50">
                  <h3 className="text-lg font-semibold text-red-600 flex items-center">
                    🛡️ Admin Settings (Visible to Admin Only)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="adminWeekdayPrice">Admin Weekday Price</Label>
                      <Input
                        id="adminWeekdayPrice"
                        name="adminWeekdayPrice"
                        type="number"
                        value={formData.adminWeekdayPrice}
                        onChange={handleInputChange}
                        placeholder="Enter admin price"
                      />
                    </div>

                    <div>
                      <Label htmlFor="adminSaturdayPrice">Admin Saturday Price</Label>
                      <Input
                        id="adminSaturdayPrice"
                        name="adminSaturdayPrice"
                        type="number"
                        value={formData.adminSaturdayPrice}
                        onChange={handleInputChange}
                        placeholder="Enter admin price"
                      />
                    </div>

                    <div>
                      <Label htmlFor="adminSundayPrice">Admin Sunday Price</Label>
                      <Input
                        id="adminSundayPrice"
                        name="adminSundayPrice"
                        type="number"
                        value={formData.adminSundayPrice}
                        onChange={handleInputChange}
                        placeholder="Enter admin price"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="googleDriveLink">Google Drive Link</Label>
                    <Input
                      id="googleDriveLink"
                      name="googleDriveLink"
                      value={formData.googleDriveLink}
                      onChange={handleInputChange}
                      placeholder="https://drive.google.com/drive/folders/..."
                    />
                    {formData.googleDriveLink && (
                      <div className="mt-2 flex items-center text-green-600">
                        <span className="text-lg mr-2">✓</span>
                        <span className="text-sm">Google Drive link added</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/dashboard">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Registering...' : 'Register Villa'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
