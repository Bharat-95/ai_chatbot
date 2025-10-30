"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const HeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const words = ['Design', 'Promote', 'Automate']

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative bg-gradient-to-br to-black/70 from-black lg:h-[90vh] md:h-[90vh] h-[80vh] max-h-[800px] w-full flex items-center justify-center px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between space-y-10 md:space-y-0">
        {/* LEFT TEXT SECTION */}
        <div className="flex flex-col max-w-xl text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            Automate Your <br />
            Facebook Marketplace <br />
            Success
          </h1>
          <p className="text-lg md:text-xl text-white font-medium mb-8">
            Respond faster, smarter and get more leads
            <br />
            without lifting a finger.
          </p>

          <Link
            href="/sign-in"
            className="w-fit px-8 py-3 rounded-full bg-white text-black text-lg font-semibold shadow-md hover:bg-black/50 hover:text-white transition"
          >
            Get Started
          </Link>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
          <Image
            src="/AiHero.png"
            alt="AI Hero"
            width={500}
            height={500}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}

export default HeroBanner
