'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, Calendar, Home, LogOut, TrendingUp, DollarSign, Users, 
  MapPin, Clock, CheckCircle, AlertCircle, Sparkles, BarChart3,
  Eye, Edit, Settings, Bell, RefreshCw, Award, Activity, Star
} from 'lucide-react'
import Link from 'next/link'
import { VillaCalendar } from '@/components/calendar/VillaCalendar'
import { VillaStats } from '@/components/dashboard/VillaStats'

interface Villa {
  id: string
  name: string
  location: string
  isApproved: boolean
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
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [villas, setVillas] = useState<Villa[]>([])
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user?.role === 'ADMIN') {
      router.push('/admin')
      return
    }

    fetchVillas()
  }, [status, session, router])

  const fetchVillas = async () => {
    try {
      const response = await fetch('/api/villas/my-villas')
      if (response.ok) {
        const data = await response.json()
        setVillas(data.villas)
        if (data.villas.length > 0) {
          setSelectedVilla(data.villas[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch villas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate total stats
  const totalBookings = villas.reduce((sum, villa) => sum + villa.bookings.length, 0)
  const totalRevenue = villas.reduce((sum, villa) => 
    sum + villa.bookings.reduce((bookingSum, booking) => bookingSum + booking.totalAmount, 0), 0
  )
  const approvedVillas = villas.filter(v => v.isApproved).length

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f8ff 0%, #e0f2fe 50%, #bae6fd 100%)' }}>
      {/* Enhanced Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to right, #2673a5, #1e5a8a)' }}>
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{
                  background: 'linear-gradient(to right, #2673a5, #1e5a8a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Villa Owner Portal</h1>
                <p className="text-xs text-gray-600">Manage Your Properties</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 hidden md:inline">
                👋 Welcome, <span className="font-semibold">{session?.user?.name}</span>
              </span>
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/api/auth/signout')}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {villas.length === 0 ? (
          <>
            {/* Welcome Banner for New Users */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 mb-8 text-white">
              <div className="text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold mb-2">Welcome to VillaRent! 🎉</h2>
                <p className="text-blue-100 text-lg mb-6">
                  Start earning by listing your villa on our platform
                </p>
              </div>
            </div>

            {/* Empty State Card */}
            <Card className="border-0 shadow-2xl">
              <CardContent className="py-16">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Home className="h-10 w-10" style={{ color: '#2673a5' }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Villas Yet</h3>
                  <p className="text-gray-600 mb-8">
                    Get started by registering your first villa. It only takes a few minutes!
                  </p>
                  
                  {/* Benefits Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                        <DollarSign className="w-5 h-5" style={{ color: '#2673a5' }} />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Earn More</h4>
                      <p className="text-xs text-gray-600">Maximize your villa's earning potential</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Easy Management</h4>
                      <p className="text-xs text-gray-600">Control availability with calendar</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Reach Guests</h4>
                      <p className="text-xs text-gray-600">Connect with thousands of travelers</p>
                    </div>
                  </div>

                  <Link href="/dashboard/register-villa">
                    <Button size="lg" className="text-white" style={{ background: 'linear-gradient(to right, #2673a5, #1e5a8a)' }}>
                      <Plus className="h-5 w-5 mr-2" />
                      Register Your First Villa
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Owner Stats Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-6 md:p-8 mb-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Your Villa Portfolio</h2>
                  <p className="text-blue-100">Track performance and manage bookings</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link href="/dashboard/register-villa">
                    <Button variant="secondary" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Villa
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fetchVillas()}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50">
                      <Home className="h-6 w-6" style={{ color: '#2673a5' }} />
                    </div>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      Total
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{villas.length}</div>
                  <p className="text-sm text-gray-600 mt-1">Your Villas</p>
                  <div className="mt-3 flex items-center text-xs text-green-600 font-medium">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {approvedVillas} approved
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-50">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      Total
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{totalBookings}</div>
                  <p className="text-sm text-gray-600 mt-1">Total Bookings</p>
                  <div className="mt-3 flex items-center text-xs text-green-600 font-medium">
                    <Activity className="w-3 h-3 mr-1" />
                    Platform active
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-50">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                      Revenue
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</div>
                  <p className="text-sm text-gray-600 mt-1">Total Earnings</p>
                  <div className="mt-3 flex items-center text-xs text-purple-600 font-medium">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Growing income
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-amber-50">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                      Status
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {villas.filter(v => v.isApproved).length === villas.length ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span>{approvedVillas}/{villas.length}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Approval Rate</p>
                  <div className="mt-3 flex items-center text-xs text-amber-600 font-medium">
                    <Star className="w-3 h-3 mr-1" />
                    Verified owner
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Villa List and Management */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar - Villa List */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Home className="w-5 h-5" style={{ color: '#2673a5' }} />
                        Your Villas
                      </CardTitle>
                      <Badge variant="secondary">{villas.length}</Badge>
                    </div>
                    <CardDescription>Select a villa to manage bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {villas.map((villa) => (
                        <div
                          key={villa.id}
                          onClick={() => setSelectedVilla(villa)}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                            selectedVilla?.id === villa.id
                              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-md'
                              : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{villa.name}</h4>
                            {selectedVilla?.id === villa.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                            <MapPin className="w-3 h-3" />
                            {villa.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={villa.isApproved
                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                              }
                            >
                              {villa.isApproved ? (
                                <><CheckCircle className="w-3 h-3 mr-1" /> Approved</>
                              ) : (
                                <><Clock className="w-3 h-3 mr-1" /> Pending</>
                              )}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {villa.bookings.length}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Link href="/dashboard/register-villa" className="block mt-4">
                      <Button className="w-full text-white" style={{ background: 'linear-gradient(to right, #2673a5, #1e5a8a)' }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Villa
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {selectedVilla && <VillaStats villa={selectedVilla} />}
              </div>

              {/* Main Content - Calendar */}
              <div className="lg:col-span-2">
                {selectedVilla ? (
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Calendar className="h-6 w-6" style={{ color: '#2673a5' }} />
                            {selectedVilla.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Availability Calendar • Manage bookings and unavailable dates
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {/* Quick Stats for Selected Villa */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold" style={{ color: '#2673a5' }}>
                            {selectedVilla.bookings.length}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Total Bookings</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedVilla.unavailableDates.length}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Blocked Dates</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            ₹{selectedVilla.bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Revenue</div>
                        </div>
                      </div>

                      <VillaCalendar 
                        villa={selectedVilla}
                        onUpdate={fetchVillas}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="py-20">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Select a Villa
                        </h3>
                        <p className="text-gray-600">
                          Choose a villa from the list to view its calendar and manage bookings
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
