'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Home, LogOut } from 'lucide-react'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Villa Owner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {session?.user?.name}</span>
              <Button variant="outline" size="sm" onClick={() => router.push('/api/auth/signout')}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {villas.length === 0 ? (
          <div className="text-center py-12">
            <Home className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No villas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by registering your first villa.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/register-villa">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Register Villa
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Villa List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    My Villas
                    <Link href="/dashboard/register-villa">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Villa
                      </Button>
                    </Link>
                  </CardTitle>
                  <CardDescription>Select a villa to manage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {villas.map((villa) => (
                      <div
                        key={villa.id}
                        onClick={() => setSelectedVilla(villa)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedVilla?.id === villa.id
                            ? 'bg-indigo-50 border-indigo-200 border'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <h4 className="font-medium text-sm">{villa.name}</h4>
                        <p className="text-xs text-gray-500">{villa.location}</p>
                        <div className="flex items-center mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              villa.isApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {villa.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedVilla && <VillaStats villa={selectedVilla} />}
            </div>

            {/* Main Content - Calendar */}
            <div className="lg:col-span-2">
              {selectedVilla ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {selectedVilla.name} - Availability Calendar
                    </CardTitle>
                    <CardDescription>
                      Manage your villa&apos;s availability and bookings. Click on dates to add unavailable periods.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VillaCalendar 
                      villa={selectedVilla}
                      onUpdate={fetchVillas}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Select a villa to view calendar
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
