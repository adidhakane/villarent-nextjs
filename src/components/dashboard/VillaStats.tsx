'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Clock } from 'lucide-react'
import { format, isThisMonth, isFuture } from 'date-fns'

interface Villa {
  id: string
  name: string
  bookings: Array<{
    id: string
    checkIn: Date
    checkOut: Date
    status: string
    totalAmount: number
    guestName?: string
  }>
  unavailableDates: Array<{
    id: string
    date: Date
  }>
}

interface VillaStatsProps {
  villa: Villa
}

export function VillaStats({ villa }: VillaStatsProps) {
  const currentMonthBookings = villa.bookings?.filter(booking => 
    isThisMonth(new Date(booking.checkIn))
  ) || []

  const upcomingBookings = villa.bookings?.filter(booking => 
    isFuture(new Date(booking.checkIn))
  ) || []

  const totalRevenue = villa.bookings?.reduce((sum, booking) => 
    sum + (booking.totalAmount || 0), 0
  ) || 0

  const stats = [
    {
      title: 'This Month',
      value: currentMonthBookings.length,
      subtitle: 'bookings',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Upcoming',
      value: upcomingBookings.length,
      subtitle: 'bookings',
      icon: Clock,
      color: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      subtitle: 'all time',
      icon: DollarSign,
      color: 'text-indigo-600'
    }
  ]

  return (
    <div className="mt-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  <div>
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
                <span className="text-sm font-bold">{stat.value}</span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-medium">{booking.guestName}</p>
                    <p className="text-gray-500">
                      {format(new Date(booking.checkIn), 'MMM d')} - {format(new Date(booking.checkOut), 'MMM d')}
                    </p>
                  </div>
                  <span className="font-medium">₹{booking.totalAmount.toLocaleString()}</span>
                </div>
              ))}
              {upcomingBookings.length > 3 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  +{upcomingBookings.length - 3} more bookings
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
