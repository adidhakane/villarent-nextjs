'use client'

import { useState, forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import { Calendar, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import "react-datepicker/dist/react-datepicker.css"

interface CustomDatePickerProps {
  selected?: Date | null
  onChange: (date: Date | null) => void
  placeholderText?: string
  minDate?: Date
  maxDate?: Date
  className?: string
  error?: boolean
  disabled?: boolean
  id?: string
  checkoutDate?: boolean
}

const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder, className, error, checkoutDate, ...props }, ref) => (
  <div className="relative">
    <input
      {...props}
      ref={ref}
      value={value}
      onClick={onClick}
      placeholder={placeholder}
      readOnly
      className={cn(
        "h-12 w-full rounded-lg border-2 bg-white px-4 pr-12 text-sm transition-colors cursor-pointer",
        error
          ? "border-red-500 focus:border-red-500"
          : checkoutDate
          ? "border-gray-200 hover:border-red-400 focus:border-red-400"
          : "border-gray-200 hover:border-blue-500 focus:border-blue-500",
        "focus:outline-none focus:ring-0",
        className
      )}
    />
    <Calendar className={cn(
      "absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 pointer-events-none",
      checkoutDate ? "text-red-400" : "text-blue-500"
    )} />
  </div>
))

CustomInput.displayName = "CustomInput"

export function CustomDatePicker({
  selected,
  onChange,
  placeholderText,
  minDate,
  maxDate,
  className,
  error = false,
  disabled = false,
  id,
  checkoutDate = false
}: CustomDatePickerProps) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      placeholderText={placeholderText}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      dateFormat="dd/MM/yyyy"
      customInput={
        <CustomInput 
          className={className} 
          error={error} 
          checkoutDate={checkoutDate}
          id={id}
        />
      }
      popperClassName="react-datepicker-popper"
      calendarClassName="react-datepicker-calendar"
      showPopperArrow={false}
      fixedHeight
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
    />
  )
}
