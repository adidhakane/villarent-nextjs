'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Villa {
  id: string
  name: string
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

interface VillaCalendarProps {
  villa: Villa
  onUpdate: () => void
}

interface CalendarDate {
  date: Date
  isCurrentMonth: boolean
  isBooked: boolean
  isUnavailable: boolean
  bookingInfo?: {
    id: string
    checkIn: Date
    checkOut: Date
    status: string
    totalAmount: number
  }
}

export function VillaCalendar({ villa, onUpdate }: VillaCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDates, setCalendarDates] = useState<CalendarDate[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDateModal, setShowDateModal] = useState(false)

  useEffect(() => {
    generateCalendarDates()
  }, [currentDate, villa])

  const generateCalendarDates = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const dates: CalendarDate[] = days.map(date => {
      const isBooked = villa.bookings?.some(booking => {
        const checkIn = new Date(booking.checkIn)
        const checkOut = new Date(booking.checkOut)
        return date >= checkIn && date <= checkOut
      })

      const isUnavailable = villa.unavailableDates?.some(unavailable => 
        isSameDay(new Date(unavailable.date), date)
      )

      const bookingInfo = villa.bookings?.find(booking => {
        const checkIn = new Date(booking.checkIn)
        const checkOut = new Date(booking.checkOut)
        return date >= checkIn && date <= checkOut
      })

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isBooked,
        isUnavailable,
        bookingInfo
      }
    })

    setCalendarDates(dates)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowDateModal(true)
  }

  const handleMarkUnavailable = async (date: Date, reason?: string) => {
    try {
      const response = await fetch('/api/villas/unavailable-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: villa.id,
          date: date.toISOString(),
          reason
        })
      })

      if (response.ok) {
        onUpdate()
        setShowDateModal(false)
      }
    } catch (error) {
      console.error('Failed to mark date unavailable:', error)
    }
  }

  const handleMarkAvailable = async (date: Date) => {
    try {
      const response = await fetch('/api/villas/unavailable-dates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: villa.id,
          date: date.toISOString()
        })
      })

      if (response.ok) {
        onUpdate()
        setShowDateModal(false)
      }
    } catch (error) {
      console.error('Failed to mark date available:', error)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  const getDayClassName = (calendarDate: CalendarDate) => {
    const { date, isCurrentMonth, isBooked, isUnavailable } = calendarDate
    const isToday = isSameDay(date, new Date())

    return cn(
      'w-full h-12 text-sm font-medium rounded-lg border-2 transition-all cursor-pointer',
      {
        'bg-gray-100 text-gray-400 border-gray-200': !isCurrentMonth,
        'bg-white text-gray-900 border-gray-200 hover:border-gray-300': isCurrentMonth && !isBooked && !isUnavailable,
        'bg-red-100 text-red-800 border-red-300': isBooked,
        'bg-yellow-100 text-yellow-800 border-yellow-300': isUnavailable && !isBooked,
        'ring-2 ring-blue-500': isToday,
      }
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDates.map((calendarDate) => (
          <button
            key={calendarDate.date.toISOString()}
            onClick={() => handleDateClick(calendarDate.date)}
            className={getDayClassName(calendarDate)}
            disabled={!calendarDate.isCurrentMonth}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span>{format(calendarDate.date, 'd')}</span>
              {calendarDate.isBooked && (
                <div className="w-1 h-1 bg-red-500 rounded-full mt-1"></div>
              )}
              {calendarDate.isUnavailable && !calendarDate.isBooked && (
                <div className="w-1 h-1 bg-yellow-500 rounded-full mt-1"></div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
          <span>Unavailable</span>
        </div>
      </div>

      {/* Date Modal */}
      {showDateModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">
              Manage Date: {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            
            {calendarDates.find(d => isSameDay(d.date, selectedDate))?.isBooked ? (
              <div className="space-y-4">
                <p className="text-red-600">This date is booked and cannot be modified.</p>
                <Button variant="outline" onClick={() => setShowDateModal(false)} className="w-full">
                  Close
                </Button>
              </div>
            ) : calendarDates.find(d => isSameDay(d.date, selectedDate))?.isUnavailable ? (
              <div className="space-y-4">
                <p className="text-yellow-600">This date is marked as unavailable.</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleMarkAvailable(selectedDate)}
                    className="flex-1"
                  >
                    Mark Available
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-green-600">This date is currently available.</p>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleMarkUnavailable(selectedDate, 'Manual block')}
                    className="flex-1"
                  >
                    Mark Unavailable
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
