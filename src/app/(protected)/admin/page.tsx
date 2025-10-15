'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, XCircle, Clock, MapPin, Users, DollarSign, Calendar, Plus, Check, Edit,
  Home, TrendingUp, AlertCircle, Eye, Search, Filter, BarChart3, Settings,
  Shield, Award, Activity, Sparkles, Bell, LogOut, Image as ImageIcon,
  Bed, Bath, Star, ExternalLink, RefreshCw
} from 'lucide-react'
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f8ff 0%, #e0f2fe 50%, #bae6fd 100%)' }}>
      {/* Enhanced Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to right, #2673a5, #1e5a8a)' }}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{
                  background: 'linear-gradient(to right, #2673a5, #1e5a8a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Admin Dashboard</h1>
                <p className="text-xs text-gray-600">System Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="hidden md:flex items-center gap-1">
                <Activity className="w-3 h-3" />
                All Systems Active
              </Badge>
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/api/auth/signout')}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h2>
              <p className="text-blue-100 text-lg">
                Manage your villa rental platform with powerful tools and insights
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchAdminData()}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full rounded-full bg-blue-100 opacity-20"></div>
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Total Villas</CardTitle>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
                <Home className="h-5 w-5" style={{ color: '#2673a5' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalVillas}</div>
              <p className="text-xs text-gray-600 mt-1">Properties managed</p>
              <div className="mt-2 flex items-center text-green-600 text-xs font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                Active & Growing
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full rounded-full bg-orange-100 opacity-20"></div>
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Pending Approvals</CardTitle>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pendingApprovals}</div>
              <p className="text-xs text-gray-600 mt-1">Awaiting review</p>
              {stats.pendingApprovals > 0 ? (
                <div className="mt-2 flex items-center text-orange-600 text-xs font-medium">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Requires attention
                </div>
              ) : (
                <div className="mt-2 flex items-center text-green-600 text-xs font-medium">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All reviewed
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full rounded-full bg-green-100 opacity-20"></div>
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Total Bookings</CardTitle>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalBookings}</div>
              <p className="text-xs text-gray-600 mt-1">Reservations made</p>
              <div className="mt-2 flex items-center text-green-600 text-xs font-medium">
                <Award className="w-3 h-3 mr-1" />
                Platform growth
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full rounded-full bg-purple-100 opacity-20"></div>
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Total Revenue</CardTitle>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">Platform earnings</p>
              <div className="mt-2 flex items-center text-purple-600 text-xs font-medium">
                <BarChart3 className="w-3 h-3 mr-1" />
                Financial health
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-2">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 bg-transparent">
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <Clock className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Pending</span>
                <Badge variant="secondary" className="ml-2 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  {pendingVillas.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="approved"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Approved</span>
                <Badge variant="secondary" className="ml-2">
                  {approvedVillas.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="calendar"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">All Villas</span>
                <Badge variant="secondary" className="ml-2">
                  {villas.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="add-location"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Locations</span>
              </TabsTrigger>
            </TabsList>
          </div>

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
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Status Banner */}
      <div className={`h-2 ${
        villa.isApproved 
          ? villa.isActive 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
            : 'bg-gradient-to-r from-gray-400 to-gray-500'
          : 'bg-gradient-to-r from-orange-500 to-amber-500'
      }`} />
      
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{villa.name}</CardTitle>
              <Badge 
                variant={villa.isApproved ? 'default' : 'secondary'}
                className={villa.isApproved ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-orange-100 text-orange-800 hover:bg-orange-100'}
              >
                {villa.isApproved ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Approved</>
                ) : (
                  <><Clock className="w-3 h-3 mr-1" /> Pending</>
                )}
              </Badge>
              <Badge 
                variant={villa.isActive ? 'default' : 'destructive'}
                className={villa.isActive ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
              >
                {villa.isActive ? (
                  <><Activity className="w-3 h-3 mr-1" /> Active</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                )}
              </Badge>
            </div>
            
            <CardDescription>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-2 rounded-lg">
                  <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: '#2673a5' }} />
                  <span className="font-medium truncate">{villa.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-purple-50 px-3 py-2 rounded-lg">
                  <Users className="h-4 w-4 flex-shrink-0 text-purple-600" />
                  <span className="font-medium">{villa.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-green-50 px-3 py-2 rounded-lg">
                  <DollarSign className="h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="font-medium">₹{villa.pricePerNight}/night</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-amber-50 px-3 py-2 rounded-lg">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-amber-600" />
                  <span className="font-medium">{villa._count.bookings} bookings</span>
                </div>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Home className="w-4 h-4" />
            Description
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">{villa.description}</p>
        </div>
        
        {/* Owner Details */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: '#2673a5' }} />
            Owner Details
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-16">Name:</span>
              <span className="font-medium text-gray-900">{villa.owner.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-16">Email:</span>
              <span className="font-medium text-blue-600">{villa.owner.email}</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {Array.isArray(villa.amenities) && villa.amenities.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: '#2673a5' }} />
              Amenities ({villa.amenities.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {villa.amenities.map((amenity, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1 bg-white">
                  <Star className="w-3 h-3 mr-1 text-amber-500" />
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {showApprovalActions && (
            <>
              <Button 
                onClick={onApprove}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                size="sm"
              >
                <CheckCircle className="h-4 w-4" />
                Approve Villa
              </Button>
              <Button 
                onClick={onReject}
                variant="destructive"
                className="flex items-center gap-2 flex-1 sm:flex-none"
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
              className="flex items-center gap-2 border-2"
            >
              <Edit className="h-4 w-4" />
              Edit Villa
            </Button>
          )}
          
          {onStatusChange && (
            <Button
              onClick={() => onStatusChange(!villa.isActive)}
              variant={villa.isActive ? "outline" : "default"}
              size="sm"
              className={villa.isActive ? 'border-red-500 text-red-600 hover:bg-red-50' : 'bg-green-600 hover:bg-green-700 text-white'}
            >
              {villa.isActive ? (
                <><XCircle className="h-4 w-4 mr-2" /> Deactivate</>
              ) : (
                <><CheckCircle className="h-4 w-4 mr-2" /> Activate</>
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
