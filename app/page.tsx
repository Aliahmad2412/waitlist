'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [redirecting, setRedirecting] = useState(true)
  
  useEffect(() => {
    // Get base path for GitHub Pages
    const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/Anchored') 
      ? '/Anchored' 
      : ''
    
    // Small delay to ensure page is loaded
    setTimeout(() => {
      window.location.href = `${basePath}/anchored`
    }, 100)
  }, [])
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <p>Redirecting...</p>
    </div>
  )
}

