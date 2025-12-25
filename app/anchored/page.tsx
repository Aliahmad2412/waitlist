'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

function getBasePath() {
  if (typeof window === 'undefined') return ''
  const pathname = window.location.pathname
  const hostname = window.location.hostname
  
  // Check if we're on GitHub Pages
  // GitHub Pages URLs are like: username.github.io/repository-name
  if (hostname.includes('github.io')) {
    // Extract repository name from pathname or use default
    if (pathname.startsWith('/waitlist')) {
      return '/waitlist'
    }
    // If on github.io but pathname doesn't start with /waitlist, still use /waitlist as basePath
    return '/waitlist'
  }
  
  // Check pathname for basePath (for testing or custom domains)
  if (pathname.startsWith('/waitlist')) {
    return '/waitlist'
  }
  
  // For local development, return empty string
  return ''
}

export default function AnchoredWaitlist() {
  // Initialize basePath immediately for SSR compatibility
  const [basePath, setBasePath] = useState(() => {
    if (typeof window !== 'undefined') {
      return getBasePath()
    }
    return ''
  })
  
  // Update basePath after mount to ensure it's correct
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const detectedBasePath = getBasePath()
      if (detectedBasePath !== basePath) {
        setBasePath(detectedBasePath)
      }
    }
  }, [basePath])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gdprConsent: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Lock scroll when form is submitted
  useEffect(() => {
    if (isSubmitted) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isSubmitted])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    
    Object.keys(sectionRefs.current).forEach((key) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => new Set(prev).add(key))
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      )
      
      if (sectionRefs.current[key]) {
        observer.observe(sectionRefs.current[key]!)
        observers.push(observer)
      }
    })
    
    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.gdprConsent) {
        throw new Error('All fields are required')
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error('Invalid email address')
      }

      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        throw new Error('The waitlist form is currently unavailable. Please contact the site administrator or try again later.')
      }

      // Insert or update waitlist entry using Supabase client
      const { data, error } = await supabase
        .from('waitlist')
        .upsert(
          {
            email: formData.email.toLowerCase(),
            first_name: formData.firstName,
            last_name: formData.lastName,
            gdpr_consent: formData.gdprConsent,
            updated_at: new Date().toISOString(),
          } as any,
          {
            onConflict: 'email',
          }
        )
        .select()

      if (error) {
        console.error('Supabase error:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        // Provide more specific error message
        if (error.message?.includes('Failed to fetch') || error.message?.includes('TypeError')) {
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
        }
        if (error.code === 'PGRST301' || error.message?.includes('permission denied') || error.message?.includes('401')) {
          throw new Error('Database access denied. Please check your Supabase configuration and RLS policies.')
        }
        throw new Error(error.message || 'Failed to save to waitlist')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-b from-white via-maize-50/30 to-maize-100">
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none"></div>
        
        {/* Dust grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] dust-grain pointer-events-none"></div>
        
        {/* Radial light behind tree */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-pearl-aqua-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        {/* Tree Image in Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-full max-w-2xl opacity-30">
              {/* Root reveal mask */}
              <div className="root-reveal-mask">
                <img
                  src={basePath ? `${basePath}/anchored_tree_transparent.png` : '/anchored_tree_transparent.png'}
                  alt="Anchored Tree"
                  key={basePath}
                  width={600}
                  height={900}
                  className="w-full h-auto"
                  loading="eager"
                />
            </div>
          </div>
        </div>
        
        {/* Main content container - Text on top */}
        <div className="relative h-full flex items-center justify-center px-4 z-10">
          <div className="max-w-4xl w-full text-center">
            {/* Text Content with 3D Animation */}
            <div className="space-y-6">
              {/* Title */}
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif bg-gradient-to-r from-pearl-aqua-500 to-maize-500 bg-clip-text text-transparent text-3d-animate">
              Anchored is coming soon.
              </h2>
              
              {/* Body text with stagger */}
              <div className="space-y-4 text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
                <p className="font-medium text-stagger-1">
                  Your name is now part of the journey.
                </p>
                <p className="text-stagger-2">
                  When <span className="italic font-medium">Anchored</span> is ready, you'll be among the first to receive it quietly, directly, and with intention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-maize-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6 md:pt-24 md:pb-8">
          <div 
            ref={(el) => { sectionRefs.current['hero'] = el }}
            className={`space-y-8 transition-all duration-1000 ${
              visibleSections.has('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-tight">
                <span className="block text-black cursor-default">
                  Anchored
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-700 font-light italic">
                by Rochelle Trow
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-16">
          {/* Opening Text */}
          <div 
            ref={(el) => { sectionRefs.current['opening'] = el }}
            className={`space-y-6 text-slate-800 leading-relaxed transition-all duration-1000 delay-100 mb-0 ${
              visibleSections.has('opening') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-lg md:text-xl font-bold text-center">
              You can look steady on the outside and still feel the strain inside.
            </p>
            <p className="text-base md:text-lg font-light">
              Many capable, high-achieving professionals keep going delivering, performing, coping while carrying a quiet tension they rarely name.
            </p>
            <p className="text-base md:text-lg font-light">
              You may be holding it together, but sensing that the pace is costing you more than it should.
            </p>
            <p className="text-base md:text-lg font-medium text-slate-900">
              If this feels familiar, nothing is wrong with you.
            </p>
            <p className="text-base md:text-lg font-light mb-0">
              You're simply carrying more than your system was designed to hold.
            </p>
            <p className="text-lg md:text-xl text-slate-900 font-light leading-relaxed -mt-6">
              <span className="font-medium italic">Anchored</span> is a book for people who want to stay grounded, clear, and human inside fast-moving systems that reward speed, pressure, and constant output.
            </p>
            <p className="text-base md:text-lg text-slate-800 font-light leading-relaxed -mt-4">
              This is not a book about stepping away from work or slowing life down.
            </p>
          </div>

          {/* Book Description */}
          <div 
            ref={(el) => { sectionRefs.current['description'] = el }}
            className={`space-y-6 transition-all duration-1000 delay-200 ${
              visibleSections.has('description') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-base md:text-lg text-slate-900 font-medium leading-relaxed">
              It's about learning how to stay whole within it.
            </p>
          </div>

          {/* Book Cover and Who It's For - Side by Side */}
          <div 
            ref={(el) => { sectionRefs.current['cover'] = el }}
            className={`my-8 md:my-10 transition-all duration-1000 delay-300 ${
              visibleSections.has('cover') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Book Cover */}
              <div className="flex justify-center md:justify-start order-2 md:order-1">
                <div className="relative group w-full max-w-[420px]">
                  <div className="relative rounded-lg shadow-2xl overflow-hidden transition-all duration-500 group-hover:shadow-3xl group-hover:scale-[1.02] bg-white">
                    <img
                      src={basePath ? `${basePath}/book-cover.jpg` : '/book-cover.jpg'}
                      alt="Anchored by Rochelle Trow - Book Cover"
                      key={basePath}
                      width={800}
                      height={1200}
                      className="w-full h-auto object-contain"
                      loading="eager"
                    />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-maize-400 to-pearl-aqua-400 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
                </div>
              </div>

              {/* Who It's For */}
              <div 
                ref={(el) => { sectionRefs.current['who'] = el }}
                className={`space-y-6 transition-all duration-1000 delay-400 order-1 md:order-2 ${
                  visibleSections.has('who') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <p className="text-lg md:text-xl text-slate-900 font-medium">
                  This book is for you if you:
                </p>
                <div className="relative pl-6 border-l-2 border-pearl-aqua-100">
                  <ul className="space-y-6 text-base md:text-lg text-slate-800 font-light">
                    {[
                      "Appear capable and composed, but feel stretched inside",
                      "Notice yourself reacting more than choosing",
                      "Carry pressure quietly rather than speak about it",
                      "Want to lead with integrity without losing yourself",
                      "Sense that something needs to change gently, not dramatically"
                    ].map((item, index) => (
                      <li 
                        key={index}
                        className="relative flex items-start transition-all duration-500 hover:translate-x-2"
                      >
                        {/* Twig Icon connecting to vertical line */}
                        <div className="absolute -left-[26px] top-1.5">
                          <svg
                            className="w-5 h-5 text-pearl-aqua-400"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {/* Horizontal twig connecting to vertical line */}
                            <line x1="0" y1="10" x2="6" y2="10" />
                            {/* Small branch/leaf extending from twig */}
                            <path d="M6 10 L8 6" />
                            <path d="M6 10 L8 14" />
                            <path d="M6 10 L9 8" />
                          </svg>
                        </div>
                        <span className="leading-relaxed pl-2">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Waitlist Section */}
          <div 
            ref={(el) => { sectionRefs.current['waitlist'] = el }}
            className={`bg-white rounded-2xl shadow-xl px-8 md:px-12 pt-8 md:pt-12 pb-4 md:pb-6 border-2 border-maize-200 transition-all duration-1000 delay-500 ${
              visibleSections.has('waitlist') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="space-y-6 mb-8">
              <h2 className="text-3xl md:text-4xl font-serif text-slate-900">
                Join the waitlist for <span className="italic text-maize-600">Anchored</span>
              </h2>
              <p className="text-base md:text-lg text-slate-700 font-light leading-relaxed">
                This book is being released on <span className="font-medium text-maize-700">26th February 2026</span>.
              </p>
              <p className="text-base md:text-lg text-slate-700 font-light leading-relaxed">
                If you'd like to be notified when it's ready to be shared, you can join the waitlist below.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-pearl-aqua-200 rounded-lg focus:ring-2 focus:ring-pearl-aqua-400 focus:border-pearl-aqua-400 transition-all duration-200 bg-white text-slate-900 placeholder-slate-400"
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-pearl-aqua-200 rounded-lg focus:ring-2 focus:ring-pearl-aqua-400 focus:border-pearl-aqua-400 transition-all duration-200 bg-white text-slate-900 placeholder-slate-400"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-white text-slate-900 placeholder-slate-400"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="gdprConsent"
                  name="gdprConsent"
                  required
                  checked={formData.gdprConsent}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 text-maize-600 focus:ring-maize-400 border-pearl-aqua-300 rounded cursor-pointer transition-all duration-200"
                />
                <label htmlFor="gdprConsent" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
                  I agree to receive emails about the <span className="italic">Anchored</span> launch. I can unsubscribe at any time. <span className="text-red-500">*</span>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-maize-500 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-maize-600 focus:outline-none focus:ring-2 focus:ring-maize-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </span>
                ) : (
                  'Join the waitlist'
                )}
              </button>
            </form>
          </div>
          
          <p className="text-lg md:text-xl text-slate-800 font-bold italic text-center mt-2 mb-0">
            If you're curious, here's what a few early readers have shared about the book.
          </p>

          {/* Testimonials */}
          <div 
            ref={(el) => { sectionRefs.current['testimonials'] = el }}
            className={`space-y-12 pt-2 border-t border-pearl-aqua-200 transition-all duration-1000 delay-600 ${
              visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  quote: "A treasure trove of wisdom for anyone who loves the world of work yet feels its weight. Rochelle invites us to stay in the system, not to escape it, and to rediscover energy, balance, and purpose from within. Her writing honours both the intelligence of organisations and the humanity of the people who keep them alive.",
                  name: "Teresa Mazur",
                  title: "Global HR Executive",
                  link: "https://linkedin.com/in/teresamazur"
                },
                {
                  quote: "A rich and insightful guide for leaders navigating today's disruptive world. Rochelle blends lived experience, grounded research, and practical reflection in a way that feels both real and usable. A book for those who want to lead through pressure and change, while still being yourself.",
                  name: "Han-Peter Gai",
                  title: "Chief Executive Officer",
                  link: "https://linkedin.com/in/hans-peter-gai-b14aa7a"
                },
                {
                  quote: "A grounded, hopeful, and deeply relevant guide for today's leaders. Rochelle brings together research, realism, and compassion to show that thriving within the system is not only possible but powerful. A book to return to whenever the pace feels too fast to breathe.",
                  name: "Rute Fernandes",
                  title: "Pharmaceuticals Executive",
                  link: "https://linkedin.com/in/rute-alves-ferreira-fernandes"
                },
                {
                  quote: "This work prompted deep introspection about my own journey, the patterns I've carried, and which ones I now choose to change. Through Rochelle's vulnerable sharing, I'm reminded that true leadership begins with continuous self-realignment. It will not only make me a better leader, but also truer to myself and those I'm privileged to impact.",
                  name: "Rozanne Leyds",
                  title: "Partner, Professional Services",
                  link: "https://linkedin.com/in/rozanne-leyds-ca-sa-ra-bbab72b"
                }
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 md:p-8 border border-pearl-aqua-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-pearl-aqua-300 group"
                >
                  <div className="space-y-4">
                    <p className="text-base md:text-lg text-slate-800 italic leading-relaxed font-light">
                      "{testimonial.quote}"
                    </p>
                    <div className="pt-4 border-t border-pearl-aqua-100">
                      <p className="text-sm font-medium text-slate-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-slate-600 font-light">
                        {testimonial.title}
                      </p>
                      <a
                        href={testimonial.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-xs text-slate-500 font-light mt-2 hover:text-slate-700 transition-colors duration-200 group/link"
                      >
                        <svg
                          className="w-4 h-4 text-slate-500 group-hover/link:text-[#0077b5] transition-colors duration-200"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span className="group-hover/link:underline">View on LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-pearl-aqua-200 bg-maize-50 mt-20 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-600 font-light">
            © {new Date().getFullYear()} Rochelle Trow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
