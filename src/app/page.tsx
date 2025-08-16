'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CustomDatePicker } from '@/components/ui/date-picker'
import { POPULAR_LOCATIONS } from '@/lib/validations'
import { 
  Star, 
  Users, 
  MapPin, 
  Calendar,
  Shield,
  Heart,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  Zap,
  Award,
  Globe,
  Wifi,
  Car,
  Home,
  Mountain,
  Sun,
  Waves,
  TreePine,
  ArrowRight,
  Search,
  ChevronDown
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    guests: 1
  })
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchErrors, setSearchErrors] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    dateRange: ''
  })

  // Get current weekend dates
  const getCurrentWeekendDates = () => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate days until next Saturday
    const daysUntilSaturday = currentDay === 6 ? 0 : (6 - currentDay)
    
    const saturday = new Date(today)
    saturday.setDate(today.getDate() + daysUntilSaturday)
    
    const sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)
    
    return {
      saturday: saturday.toISOString().split('T')[0],
      sunday: sunday.toISOString().split('T')[0]
    }
  }

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && !(event.target as Element).closest('nav')) {
        setMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [mobileMenuOpen])

  const handleSearch = () => {
    // Reset errors
    setSearchErrors({ location: '', checkIn: '', checkOut: '', dateRange: '' })
    
    // Validation
    const errors = { location: '', checkIn: '', checkOut: '', dateRange: '' }
    
    if (!searchData.location) {
      errors.location = 'Please select a location'
    }
    
    if (!searchData.checkIn) {
      errors.checkIn = 'Please select check-in date'
    }
    
    if (!searchData.checkOut) {
      errors.checkOut = 'Please select check-out date'
    }
    
    if (searchData.checkIn && searchData.checkOut) {
      if (searchData.checkIn >= searchData.checkOut) {
        errors.dateRange = 'Check-out date must be after check-in date'
      }
      
      if (searchData.checkIn.getTime() === searchData.checkOut.getTime()) {
        errors.dateRange = 'Check-in and check-out dates cannot be the same'
      }
    }
    
    // Show errors if any
    if (Object.values(errors).some(error => error)) {
      setSearchErrors(errors)
      return
    }

    const searchParams = new URLSearchParams({
      location: searchData.location,
      checkIn: searchData.checkIn?.toISOString().split('T')[0] || '',
      checkOut: searchData.checkOut?.toISOString().split('T')[0] || '',
      guests: searchData.guests.toString()
    })

    router.push(`/search?${searchParams.toString()}`)
  }

  const handleQuickSearch = (location: string) => {
    const weekendDates = getCurrentWeekendDates()
    
    const searchParams = new URLSearchParams({
      location,
      checkIn: weekendDates.saturday,
      checkOut: weekendDates.sunday,
      guests: '4'
    })

    router.push(`/search?${searchParams.toString()}`)
  }

  const testimonials = [
    {
      name: "Priya & Raj",
      location: "Mumbai",
      rating: 5,
      text: "Amazing villa in Lonavala! Perfect for our anniversary weekend. Seamless booking through WhatsApp.",
      villa: "Lonavala"
    },
    {
      name: "Sharma Family",
      location: "Pune",
      rating: 5,
      text: "Booked for family reunion. The villa was exactly as shown. Great communication from Namaha Stays!",
      villa: "Mahabaleshwar"
    },
    {
      name: "Tech Team Outing",
      location: "Bangalore",
      rating: 5,
      text: "Perfect for our team retreat. Swimming pool was a hit! Will definitely book again.",
      villa: "Panchgani"
    }
  ]

  const popularDestinations = [
    { 
      name: 'Lonavala', 
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
      tagline: 'Hill Station Paradise', 
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      name: 'Alibaug', 
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&crop=center',
      tagline: 'Coastal Retreat', 
      color: 'from-blue-500 to-cyan-600' 
    },
    { 
      name: 'Mahabaleshwar', 
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
      tagline: 'Nature\'s Bliss', 
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      name: 'Panchgani', 
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
      tagline: 'Scenic Views', 
      color: 'from-amber-500 to-orange-600' 
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ 
                background: 'linear-gradient(to right, #2673a5, #1e5a8a)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                VillaRent
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">Villa Owner Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" style={{ 
                  background: 'linear-gradient(to right, #2673a5, #1e5a8a)',
                  borderColor: 'transparent'
                }} className="hover:opacity-90 text-white">
                  List Your Villa
                </Button>
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-md">
              <div className="px-4 py-4 space-y-3">
                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Villa Owner Login</Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button style={{ 
                    background: 'linear-gradient(to right, #2673a5, #1e5a8a)',
                    borderColor: 'transparent'
                  }} className="w-full text-white hover:opacity-90">
                    List Your Villa
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-blue-500 text-blue-600"
                  onClick={() => {
                    const whatsappUrl = `https://wa.me/919270355968?text=${encodeURIComponent("Hi! I'd like to know more about villa bookings.")}`
                    window.open(whatsappUrl, '_blank')
                    setMobileMenuOpen(false)
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Quick Help
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center pt-16"
        style={{
          background: 'linear-gradient(135deg, #f0f8ff 0%, #e0f2fe 50%, #bae6fd 100%)'
        }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'url("/hero-section.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            {/* Trust Badge */}
            <div 
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{
                background: 'linear-gradient(135deg, #2673a5, #1e5a8a)',
                color: 'white'
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Trusted by 1000+ Happy Guests
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Dream Villa
              <br />
              <span style={{ 
                background: 'linear-gradient(to right, #2673a5, #1e5a8a)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Awaits You
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Book premium villas in Maharashtra's most beautiful destinations. 
              <span className="font-semibold text-gray-800"> No registration required</span> • 
              <span className="font-semibold text-gray-800"> Instant booking via WhatsApp</span>
            </p>

            {/* Social Proof Stats */}
            <div className="flex justify-center items-center space-x-8 mb-12 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-amber-400 mr-1 fill-current" />
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-1" style={{ color: '#2673a5' }} />
                <span className="font-semibold">500+ Bookings</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-1" style={{ color: '#2673a5' }} />
                <span className="font-semibold">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Enhanced Search Card */}
          <Card id="search-card" className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold flex items-center justify-center">
                <Search className="w-6 h-6 mr-2" style={{ color: '#2673a5' }} />
                Find Your Perfect Villa
              </CardTitle>
              <CardDescription className="text-lg">Start your dream vacation in 3 simple steps</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" style={{ color: '#2673a5' }} />
                    Where to? *
                  </Label>
                  <Select onValueChange={(value) => setSearchData(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger className={`h-12 border-2 transition-colors ${
                      searchErrors.location ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                    }`}>
                      <SelectValue placeholder="Choose destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_LOCATIONS.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {searchErrors.location && (
                    <p className="text-red-500 text-xs mt-1">{searchErrors.location}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="checkIn" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" style={{ color: '#2673a5' }} />
                    Check-in *
                  </Label>
                  <CustomDatePicker
                    id="checkIn"
                    selected={searchData.checkIn}
                    onChange={(date) => setSearchData(prev => ({ ...prev, checkIn: date }))}
                    placeholderText="Select check-in date"
                    minDate={new Date()}
                    error={!!searchErrors.checkIn}
                  />
                  {searchErrors.checkIn && (
                    <p className="text-red-500 text-xs mt-1">{searchErrors.checkIn}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="checkOut" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" style={{ color: '#d63384' }} />
                    Check-out *
                  </Label>
                  <CustomDatePicker
                    id="checkOut"
                    selected={searchData.checkOut}
                    onChange={(date) => setSearchData(prev => ({ ...prev, checkOut: date }))}
                    placeholderText="Select check-out date"
                    minDate={searchData.checkIn || new Date()}
                    error={!!searchErrors.checkOut}
                    checkoutDate={true}
                  />
                  {searchErrors.checkOut && (
                    <p className="text-red-500 text-xs mt-1">{searchErrors.checkOut}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guests" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Users className="w-4 h-4 mr-1 text-teal-500" />
                    Guests (Optional)
                  </Label>
                  <Select onValueChange={(value) => setSearchData(prev => ({ ...prev, guests: parseInt(value) }))}>
                    <SelectTrigger className="h-12 border-2 border-gray-200">
                      <SelectValue placeholder="How many?" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10,15,20].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Guest{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Date Range Error */}
              {searchErrors.dateRange && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {searchErrors.dateRange}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleSearch} 
                  style={{ 
                    background: 'linear-gradient(to right, #2673a5, #1e5a8a)',
                    borderColor: 'transparent'
                  }}
                  className="flex-1 h-14 text-lg font-semibold text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Villas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const whatsappUrl = `https://wa.me/919270355968?text=${encodeURIComponent("Hi! I'd like to know more about villa bookings. Can you help me find the perfect villa?")}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  className="h-14 px-6 border-2 text-white hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #2673a5, #1e5a8a)',
                    borderColor: '#2673a5'
                  }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Quick Help
                </Button>
              </div>

              {/* Urgency Indicator */}
              <div className="mt-4 text-center">
                <p className="text-sm font-medium flex items-center justify-center" style={{ color: '#2673a5' }}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="animate-pulse">🔥</span> 12 people booked villas in the last 24 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Destinations */}
      <section 
        className="py-20"
        style={{
          background: 'linear-gradient(135deg, #f0f8ff 0%, #e0f2fe 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular Destinations you must visit this weekend!
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover Maharashtra's most beautiful villa destinations for your weekend getaway
            </p>
            <div 
              className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'linear-gradient(135deg, #2673a5, #1e5a8a)',
                color: 'white'
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              This Weekend: {(() => {
                const dates = getCurrentWeekendDates()
                return `${new Date(dates.saturday).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${new Date(dates.sunday).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
              })()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((destination) => (
              <Card 
                key={destination.name}
                className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                onClick={() => handleQuickSearch(destination.name)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-700">
                      Available
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="text-white text-2xl font-bold drop-shadow-lg">
                      {destination.name}
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4">{destination.tagline}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">From ₹3,500/night</span>
                    <div className="flex items-center font-medium" style={{ color: '#2673a5' }}>
                      <span className="text-sm mr-1">Book for weekend</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Why 1000+ Guests Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the difference with India's most trusted villa rental platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-amber-500" />,
                title: "Instant Booking",
                description: "Book directly via WhatsApp. No lengthy forms or waiting periods. Get confirmed in minutes!",
                highlight: "No Registration Required"
              },
              {
                icon: <Shield className="w-8 h-8" style={{ color: '#2673a5' }} />,
                title: "Verified Villas",
                description: "Every villa is personally verified by our team. What you see is exactly what you get.",
                highlight: "100% Authentic"
              },
              {
                icon: <Award className="w-8 h-8" style={{ color: '#2673a5' }} />,
                title: "Best Price Guarantee",
                description: "Transparent pricing with no hidden fees. Get the best rates directly from villa owners.",
                highlight: "Transparent Pricing"
              },
              {
                icon: <Phone className="w-8 h-8" style={{ color: '#2673a5' }} />,
                title: "24/7 Support",
                description: "Our dedicated team is always available to help with your booking and stay experience.",
                highlight: "Always Available"
              },
              {
                icon: <Heart className="w-8 h-8 text-rose-500" />,
                title: "Guest Satisfaction",
                description: "4.9/5 rating from 500+ happy guests. Your perfect vacation is our top priority.",
                highlight: "4.9★ Rating"
              },
              {
                icon: <Globe className="w-8 h-8" style={{ color: '#2673a5' }} />,
                title: "Prime Locations",
                description: "Handpicked villas in Maharashtra's most scenic and accessible destinations.",
                highlight: "Premium Locations"
              }
            ].map((feature, index) => (
              <Card key={index} className="group p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <Badge variant="secondary" className="mb-3 bg-blue-50" style={{ color: '#2673a5' }}>
                    {feature.highlight}
                  </Badge>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section 
        className="py-20"
        style={{
          background: 'linear-gradient(135deg, #f0f8ff 0%, #e0f2fe 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Happy Guests, Perfect Vacations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Read what our guests say about their villa experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-4 italic">
                  "{testimonial.text}"
                </blockquote>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.villa}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-white" style={{ 
        background: 'linear-gradient(to right, #2673a5, #1e5a8a)' 
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready for Your Dream Vacation?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join 1000+ happy guests who found their perfect villa with us
          </p>
          
          <div className="group flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => {
                const searchCard = document.querySelector('#search-card')
                if (searchCard) {
                  searchCard.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="hover:bg-gray-100 text-lg px-8 py-4 h-auto"
              style={{ 
                background: 'white', 
                color: '#2673a5' 
              }}
            >
              <Search className="w-5 h-5 mr-2" />
              Search Villas Now
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const whatsappUrl = `https://wa.me/919270355968?text=${encodeURIComponent("Hi! I want to book a villa for my vacation. Can you help me with available options?")}`
                window.open(whatsappUrl, '_blank')
              }}
              className="text-lg px-8 py-4 h-auto transition-all duration-300"
              style={{
                borderColor: 'white',
                backgroundColor: 'transparent',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.color = '#2673a5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'white'
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Book via WhatsApp
            </Button>
          </div>

          <div className="mt-8 text-blue-100">
            <p className="flex items-center justify-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              No registration required • Instant confirmation • 24/7 support
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="text-white py-12"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #2673a5 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 
                className="text-2xl font-bold mb-4"
                style={{
                  background: 'linear-gradient(135deg, #2673a5, #1e5a8a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                VillaRent
              </h3>
              <p className="text-gray-400 mb-4">
                Making dream vacations accessible to everyone with premium villa rentals across Maharashtra.
              </p>
              <div className="flex space-x-4">
                <Button
                  size="sm"
                  onClick={() => {
                    const whatsappUrl = `https://wa.me/919270355968?text=${encodeURIComponent("Hi! I'm interested in booking a villa. Can you help me with available options and pricing?")}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  className="text-white hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #2673a5, #1e5a8a)',
                    borderColor: 'transparent'
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Popular Destinations</h4>
              <ul className="space-y-2 text-gray-400">
                {POPULAR_LOCATIONS.slice(0, 5).map(location => (
                  <li key={location}>
                    <button 
                      onClick={() => handleQuickSearch(location)}
                      className="hover:text-white transition-colors"
                    >
                      {location}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Villa Owners</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">List Your Villa</Link></li>
                <li><span>Maximize Revenue</span></li>
                <li><span>Easy Management</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +91 92703 55968
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +91 92703 55968
                </li>
                <li className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Support
                </li>
                <li>24/7 Assistance</li>
                <li>Guest Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VillaRent by Namaha Stays. All rights reserved.</p>
            <p className="mt-2 text-sm">Making dream vacations accessible • Trusted by 1000+ guests</p>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          size="lg"
          onClick={() => {
            const whatsappUrl = `https://wa.me/919270355968?text=${encodeURIComponent("Hi! I want to book a villa for my vacation. Can you help me with available options?")}`
            window.open(whatsappUrl, '_blank')
          }}
          className="rounded-full w-16 h-16 shadow-2xl animate-pulse text-white hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #2673a5, #1e5a8a)',
            borderColor: 'transparent'
          }}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
