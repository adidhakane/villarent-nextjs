'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Home, Save } from 'lucide-react'
import { getVillaImageUrlWithFallback } from '@/lib/utils/image-utils'

interface Villa {
  id: string
  name: string
  description: string
  location: string
  address: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  pricePerNight: number
  amenities: string[]
  images: string[]
  ownerPhone: string
  ownerEmail: string
  weekdayPrice: number
  fridayPrice: number
  saturdayPrice: number
  sundayPrice: number
  checkInTime: string
  checkOutTime: string
  adminWeekdayPrice?: number
  adminSaturdayPrice?: number
  adminSundayPrice?: number
  googleDriveLink?: string
  owner: {
    id: string
    name: string
    email: string
  }
}

export default function EditVillaPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [villa, setVilla] = useState<Villa | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
    pricePerNight: 0,
    amenities: [] as string[],
    ownerPhone: '',
    ownerEmail: '',
    weekdayPrice: 0,
    fridayPrice: 0,
    saturdayPrice: 0,
    sundayPrice: 0,
    checkInTime: '',
    checkOutTime: '',
    adminWeekdayPrice: 0,
    adminSaturdayPrice: 0,
    adminSundayPrice: 0,
    googleDriveLink: ''
  })

  const amenitiesList = [
    'Swimming Pool', 'Wi-Fi', 'Air Conditioning', 'Kitchen', 'Parking',
    'BBQ Area', 'Garden', 'Balcony', 'Hot Tub', 'Gym', 'Pet Friendly',
    'Beach Access', 'Mountain View', 'Fireplace', 'Laundry'
  ]

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/admin')
      return
    }
    
    fetchVilla()
  }, [params.id, session])

  const fetchVilla = async () => {
    try {
      const response = await fetch(`/api/admin/villas/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setVilla(data.villa)
        
        // Populate form data
        setFormData({
          name: data.villa.name || '',
          description: data.villa.description || '',
          location: data.villa.location || '',
          address: data.villa.address || '',
          maxGuests: data.villa.maxGuests || 1,
          bedrooms: data.villa.bedrooms || 1,
          bathrooms: data.villa.bathrooms || 1,
          pricePerNight: data.villa.pricePerNight || 0,
          amenities: data.villa.amenities || [],
          ownerPhone: data.villa.ownerPhone || '',
          ownerEmail: data.villa.ownerEmail || '',
          weekdayPrice: data.villa.weekdayPrice || 0,
          fridayPrice: data.villa.fridayPrice || 0,
          saturdayPrice: data.villa.saturdayPrice || 0,
          sundayPrice: data.villa.sundayPrice || 0,
          checkInTime: data.villa.checkInTime || '',
          checkOutTime: data.villa.checkOutTime || '',
          adminWeekdayPrice: data.villa.adminWeekdayPrice || 0,
          adminSaturdayPrice: data.villa.adminSaturdayPrice || 0,
          adminSundayPrice: data.villa.adminSundayPrice || 0,
          googleDriveLink: data.villa.googleDriveLink || ''
        })
      } else {
        setError('Failed to fetch villa details')
      }
    } catch (error) {
      setError('Error loading villa')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['maxGuests', 'bedrooms', 'bathrooms', 'pricePerNight', 'weekdayPrice', 'fridayPrice', 'saturdayPrice', 'sundayPrice', 'adminWeekdayPrice', 'adminSaturdayPrice', 'adminSundayPrice'].includes(name)
        ? parseFloat(value) || 0 
        : value
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
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({ ...prev, coverImage: 'Image size must be less than 5MB' }))
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({ ...prev, coverImage: 'Please select a valid image file' }))
        return
      }
      
      setSelectedImage(file)
      setValidationErrors(prev => ({ ...prev, coverImage: '' }))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setValidationErrors({})

    try {
      const formDataToSend = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'amenities') {
          return // Handle separately
        }
        
        if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value.toString())
        }
      })
      
      // Add amenities as JSON
      formDataToSend.append('amenitiesJson', JSON.stringify(formData.amenities))
      
      // Add new image if selected
      if (selectedImage) {
        formDataToSend.append('coverImage', selectedImage)
      }

      const response = await fetch(`/api/admin/villas/${params.id}`, {
        method: 'PUT',
        body: formDataToSend
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin?message=Villa updated successfully!')
      } else {
        if (data.validation) {
          setValidationErrors(data.validation)
          setError('Please fix the validation errors below.')
        } else {
          setError(data.error || 'Failed to update villa')
        }
      }
    } catch (error) {
      setError('Failed to update villa')
    } finally {
      setSaving(false)
    }
  }

  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName] ? (
      <p className="text-sm text-red-500 mt-1">{validationErrors[fieldName]}</p>
    ) : null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading villa details...</p>
        </div>
      </div>
    )
  }

  if (!villa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Villa Not Found</h1>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Admin
              </Link>
              <Home className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Edit Villa</h1>
            </div>
            <span className="text-sm text-gray-700">Admin: {session?.user?.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Edit Villa: {villa.name}</CardTitle>
            <p className="text-sm text-gray-600">Owner: {villa.owner.name} ({villa.owner.email})</p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Villa Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className={validationErrors.name ? 'border-red-500' : ''}
                    />
                    {getFieldError('name')}
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Lonavala, Mahabaleshwar"
                      className={validationErrors.location ? 'border-red-500' : ''}
                    />
                    {getFieldError('location')}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your villa..."
                    className={`min-h-[100px] ${validationErrors.description ? 'border-red-500' : ''}`}
                  />
                  {getFieldError('description')}
                </div>

                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Complete address with landmarks"
                    className={validationErrors.address ? 'border-red-500' : ''}
                  />
                  {getFieldError('address')}
                </div>
              </div>

              {/* Villa Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600">Villa Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="maxGuests">Max Guests *</Label>
                    <Input
                      id="maxGuests"
                      name="maxGuests"
                      type="number"
                      min="1"
                      required
                      value={formData.maxGuests}
                      onChange={handleInputChange}
                      className={validationErrors.maxGuests ? 'border-red-500' : ''}
                    />
                    {getFieldError('maxGuests')}
                  </div>

                  <div>
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="1"
                      required
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className={validationErrors.bedrooms ? 'border-red-500' : ''}
                    />
                    {getFieldError('bedrooms')}
                  </div>

                  <div>
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min="1"
                      required
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className={validationErrors.bathrooms ? 'border-red-500' : ''}
                    />
                    {getFieldError('bathrooms')}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-600">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="ownerPhone">Phone Number *</Label>
                    <Input
                      id="ownerPhone"
                      name="ownerPhone"
                      required
                      value={formData.ownerPhone}
                      onChange={handleInputChange}
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
                      className={validationErrors.ownerEmail ? 'border-red-500' : ''}
                    />
                    {getFieldError('ownerEmail')}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-yellow-600">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <Label htmlFor="weekdayPrice">Weekday Price (₹) *</Label>
                    <Input
                      id="weekdayPrice"
                      name="weekdayPrice"
                      type="number"
                      min="0"
                      step="100"
                      required
                      value={formData.weekdayPrice}
                      onChange={handleInputChange}
                      className={validationErrors.weekdayPrice ? 'border-red-500' : ''}
                    />
                    {getFieldError('weekdayPrice')}
                  </div>

                  <div>
                    <Label htmlFor="fridayPrice">Friday Price (₹) *</Label>
                    <Input
                      id="fridayPrice"
                      name="fridayPrice"
                      type="number"
                      min="0"
                      step="100"
                      required
                      value={formData.fridayPrice}
                      onChange={handleInputChange}
                      className={validationErrors.fridayPrice ? 'border-red-500' : ''}
                    />
                    {getFieldError('fridayPrice')}
                  </div>

                  <div>
                    <Label htmlFor="saturdayPrice">Saturday Price (₹) *</Label>
                    <Input
                      id="saturdayPrice"
                      name="saturdayPrice"
                      type="number"
                      min="0"
                      step="100"
                      required
                      value={formData.saturdayPrice}
                      onChange={handleInputChange}
                      className={validationErrors.saturdayPrice ? 'border-red-500' : ''}
                    />
                    {getFieldError('saturdayPrice')}
                  </div>

                  <div>
                    <Label htmlFor="sundayPrice">Sunday Price (₹) *</Label>
                    <Input
                      id="sundayPrice"
                      name="sundayPrice"
                      type="number"
                      min="0"
                      step="100"
                      required
                      value={formData.sundayPrice}
                      onChange={handleInputChange}
                      className={validationErrors.sundayPrice ? 'border-red-500' : ''}
                    />
                    {getFieldError('sundayPrice')}
                  </div>
                </div>

                <div>
                  <Label htmlFor="pricePerNight">Base Price Per Night (₹) *</Label>
                  <Input
                    id="pricePerNight"
                    name="pricePerNight"
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                    className={validationErrors.pricePerNight ? 'border-red-500' : ''}
                  />
                  {getFieldError('pricePerNight')}
                </div>
              </div>

              {/* Admin Pricing */}
              <div className="space-y-4 bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-600">🔧 Admin Pricing (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="adminWeekdayPrice">Admin Weekday Price (₹)</Label>
                    <Input
                      id="adminWeekdayPrice"
                      name="adminWeekdayPrice"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.adminWeekdayPrice}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminSaturdayPrice">Admin Saturday Price (₹)</Label>
                    <Input
                      id="adminSaturdayPrice"
                      name="adminSaturdayPrice"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.adminSaturdayPrice}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminSundayPrice">Admin Sunday Price (₹)</Label>
                    <Input
                      id="adminSundayPrice"
                      name="adminSundayPrice"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.adminSundayPrice}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="googleDriveLink">Google Drive Link</Label>
                  <Input
                    id="googleDriveLink"
                    name="googleDriveLink"
                    type="url"
                    value={formData.googleDriveLink}
                    onChange={handleInputChange}
                    placeholder="https://drive.google.com/..."
                  />
                  <p className="text-sm text-gray-500 mt-1">Link to Google Drive folder with additional villa photos and documents</p>
                </div>
              </div>

              {/* Check-in/Check-out */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-600">Check-in & Check-out Times</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="checkInTime">Check-in Time *</Label>
                    <Input
                      id="checkInTime"
                      name="checkInTime"
                      type="time"
                      required
                      value={formData.checkInTime}
                      onChange={handleInputChange}
                      className={validationErrors.checkInTime ? 'border-red-500' : ''}
                    />
                    {getFieldError('checkInTime')}
                  </div>

                  <div>
                    <Label htmlFor="checkOutTime">Check-out Time *</Label>
                    <Input
                      id="checkOutTime"
                      name="checkOutTime"
                      type="time"
                      required
                      value={formData.checkOutTime}
                      onChange={handleInputChange}
                      className={validationErrors.checkOutTime ? 'border-red-500' : ''}
                    />
                    {getFieldError('checkOutTime')}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-indigo-600">Amenities *</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {amenitiesList.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        name="amenities"
                        value={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="text-sm text-gray-700">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
                {getFieldError('amenities')}
              </div>

              {/* Current Image and New Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600">Villa Images</h3>
                
                {/* Current Image */}
                {villa.images && villa.images.length > 0 && (
                  <div>
                    <Label className="block mb-2">Current Image</Label>
                    <img 
                      src={getVillaImageUrlWithFallback(villa.images)}
                      alt="Current villa image"
                      className="h-32 w-48 object-cover rounded-md border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-villa.svg'
                      }}
                    />
                  </div>
                )}

                {/* New Image Upload */}
                <div>
                  <Label htmlFor="coverImage">Upload New Image (Optional)</Label>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img 
                            src={imagePreview} 
                            alt="New preview" 
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
                            Remove New Image
                          </button>
                        </div>
                      ) : (
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="coverImage" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Choose New File</span>
                            <input 
                              id="coverImage" 
                              name="coverImage" 
                              type="file" 
                              className="sr-only" 
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">No new file chosen</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>
                  {getFieldError('coverImage')}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/admin">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving} className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
