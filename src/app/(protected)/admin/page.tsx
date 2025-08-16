'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, MapPin, Users, DollarSign, Calendar, Plus, Check, Edit } from 'lucide-react'
import { VillaCalendar } from '@/components/calendar/VillaCalendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Villa {
  id: string
  name: string
  description: string
  location: string
  pricePerNight: number
  maxGuests: number
  amenities: string[]
  imageUrls: string[]
  isApproved: boolean
  isActive: boolean
  createdAt: string
  bookings: Array<{
    id: string
    checkIn: Date
    checkOut: Date
    status: string
    totalAmount: number
  }>
  unavailableDates: Array<{
    id: string
    date: Date
  }>
  owner: {
    id: string
    name: string
    email: string
  }
  _count: {
    bookings: number
  }
}

interface AdminStats {
  totalVillas: number
  pendingApprovals: number
  totalBookings: number
  totalRevenue: number
}

interface Location {
  id: string
  name: string
  createdAt: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [villas, setVillas] = useState<Villa[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalVillas: 0,
    pendingApprovals: 0,
    totalBookings: 0,
    totalRevenue: 0
  })
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Location management state
  const [locations, setLocations] = useState<Location[]>([])
  const [locationName, setLocationName] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [locationSuccess, setLocationSuccess] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }

    fetchAdminData()
    fetchLocations()
  }, [session, status, router])

  const fetchAdminData = async () => {
    try {
      const [villasResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/villas'),
        fetch('/api/admin/stats')
      ])

      if (villasResponse.ok && statsResponse.ok) {
        const villasData = await villasResponse.json()
        const statsData = await statsResponse.json()
        setVillas(villasData.villas)
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Location management functions
  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/admin/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations)
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    }
  }

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!locationName.trim()) {
      setLocationError('Location name is required')
      return
    }

    setLocationLoading(true)
    setLocationError('')
    setLocationSuccess('')

    try {
      const response = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: locationName.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setLocationSuccess('Location added successfully!')
        setLocationName('')
        fetchLocations() // Refresh the list
      } else {
        setLocationError(data.error || 'Failed to add location')
      }
    } catch (error) {
      setLocationError('Something went wrong. Please try again.')
    }

    setLocationLoading(false)
  }

  const handleApprovalChange = async (villaId: string, isApproved: boolean) => {
    try {
      const response = await fetch('/api/admin/villas/approval', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ villaId, isApproved })
      })

      if (response.ok) {
        setVillas(villas.map(villa => 
          villa.id === villaId 
            ? { ...villa, isApproved }
            : villa
        ))
        setStats(prev => ({
          ...prev,
          pendingApprovals: isApproved 
            ? prev.pendingApprovals - 1 
            : prev.pendingApprovals + 1
        }))
      }
    } catch (error) {
      console.error('Error updating villa approval:', error)
    }
  }

  const handleActiveStatusChange = async (villaId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/villas/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ villaId, isActive })
      })

      if (response.ok) {
        setVillas(villas.map(villa => 
          villa.id === villaId 
            ? { ...villa, isActive }
            : villa
        ))
      }
    } catch (error) {
      console.error('Error updating villa status:', error)
    }
  }

  const handleEditVilla = (villaId: string) => {
    router.push(`/admin/villas/${villaId}/edit`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user.role !== 'ADMIN') {
    return null
  }

  const pendingVillas = villas.filter(villa => !villa.isApproved)
  const approvedVillas = villas.filter(villa => villa.isApproved)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage villas, approve registrations, and view system statistics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Villas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVillas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">
              Pending Approvals ({pendingVillas.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved Villas ({approvedVillas.length})
            </TabsTrigger>
            <TabsTrigger value="calendar">
              Villa Calendar
            </TabsTrigger>
            <TabsTrigger value="all">
              All Villas ({villas.length})
            </TabsTrigger>
            <TabsTrigger value="add-location">
              Add Location
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid gap-6">
              {pendingVillas.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
                      <p className="text-gray-500">All villa registrations have been reviewed.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                pendingVillas.map((villa) => (
                  <VillaCard
                    key={villa.id}
                    villa={villa}
                    onApprove={() => handleApprovalChange(villa.id, true)}
                    onReject={() => handleApprovalChange(villa.id, false)}
                    onStatusChange={(isActive) => handleActiveStatusChange(villa.id, isActive)}
                    showApprovalActions={true}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <div className="grid gap-6">
              {approvedVillas.map((villa) => (
                <VillaCard
                  key={villa.id}
                  villa={villa}
                  onStatusChange={(isActive) => handleActiveStatusChange(villa.id, isActive)}
                  onEdit={() => handleEditVilla(villa.id)}
                  showApprovalActions={false}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Villa Calendar Management</CardTitle>
                <CardDescription>
                  Select a villa to view and manage its availability calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Villa
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedVilla?.id || ''}
                    onChange={(e) => {
                      const villa = villas.find(v => v.id === e.target.value)
                      setSelectedVilla(villa || null)
                    }}
                  >
                    <option value="">Choose a villa...</option>
                    {approvedVillas.map((villa) => (
                      <option key={villa.id} value={villa.id}>
                        {villa.name} - {villa.location}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedVilla && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900">{selectedVilla.name}</h3>
                      <p className="text-sm text-gray-600">{selectedVilla.location}</p>
                      <p className="text-sm text-gray-600">Owner: {selectedVilla.owner.name}</p>
                    </div>
                    <VillaCalendar
                      villa={selectedVilla}
                      onUpdate={() => {
                        // Refresh data if needed
                        console.log('Calendar updated')
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-6">
              {villas.map((villa) => (
                <VillaCard
                  key={villa.id}
                  villa={villa}
                  onApprove={() => handleApprovalChange(villa.id, true)}
                  onReject={() => handleApprovalChange(villa.id, false)}
                  onStatusChange={(isActive) => handleActiveStatusChange(villa.id, isActive)}
                  showApprovalActions={!villa.isApproved}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="add-location" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Add Location Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Location
                  </CardTitle>
                  <CardDescription>
                    Add new villa locations that will appear in the location dropdown when adding or filtering villas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddLocation} className="space-y-4">
                    {locationError && (
                      <Alert variant="destructive">
                        <AlertDescription>{locationError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {locationSuccess && (
                      <Alert className="border-green-200 bg-green-50">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{locationSuccess}</AlertDescription>
                      </Alert>
                    )}

                    <div>
                      <Label htmlFor="locationName">Location Name *</Label>
                      <Input
                        id="locationName"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="e.g., Manali"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={locationLoading} className="w-full">
                      {locationLoading ? 'Adding...' : 'Add Location'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Existing Locations */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Locations ({locations.length})</CardTitle>
                  <CardDescription>
                    Currently available locations in the system.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {locations.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No locations added yet.</p>
                    ) : (
                      locations.map((location) => (
                        <div key={location.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="font-medium">{location.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(location.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface VillaCardProps {
  villa: Villa
  onApprove?: () => void
  onReject?: () => void
  onStatusChange?: (isActive: boolean) => void
  onEdit?: () => void
  showApprovalActions?: boolean
}

function VillaCard({ villa, onApprove, onReject, onStatusChange, onEdit, showApprovalActions }: VillaCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {villa.name}
              <Badge variant={villa.isApproved ? 'default' : 'secondary'}>
                {villa.isApproved ? 'Approved' : 'Pending'}
              </Badge>
              <Badge variant={villa.isActive ? 'default' : 'destructive'}>
                {villa.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </CardTitle>
            <CardDescription>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {villa.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Up to {villa.maxGuests} guests
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${villa.pricePerNight}/night
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {villa._count.bookings} bookings
                </span>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-700">{villa.description}</p>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Owner Details:</p>
            <div className="text-sm text-gray-600">
              <p>Name: {villa.owner.name}</p>
              <p>Email: {villa.owner.email}</p>
            </div>
          </div>

          {Array.isArray(villa.amenities) && villa.amenities.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Amenities:</p>
              <div className="flex flex-wrap gap-2">
                {villa.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline">{amenity}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {showApprovalActions && (
              <>
                <Button 
                  onClick={onApprove}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                <Button 
                  onClick={onReject}
                  variant="destructive"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            
            {onEdit && (
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            
            {onStatusChange && (
              <Button
                onClick={() => onStatusChange(!villa.isActive)}
                variant={villa.isActive ? "destructive" : "default"}
                size="sm"
              >
                {villa.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
