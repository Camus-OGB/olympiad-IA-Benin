'use client'

import React, { useEffect } from 'react'
import { Navbar, Footer } from '@/components/layouts'

export default function VitrineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    document.body.classList.add('vitrine-watermark')
    return () => {
      document.body.classList.remove('vitrine-watermark')
    }
  }, [])

  return (
    <>
      <Navbar />
      <main className="flex-grow min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
