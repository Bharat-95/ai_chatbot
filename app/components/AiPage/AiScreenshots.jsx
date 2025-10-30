'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const screenshots = [
  '/screenshots/1.png',
  '/screenshots/2.png',
  '/screenshots/3.png',
  '/screenshots/4.png',
  '/screenshots/5.png',
  '/screenshots/6.png',
  '/screenshots/7.png',
  '/screenshots/8.png',
]

const ScreenshotCarousel = () => {
  return (
    <section className="bg-[#0E0F16] py-16 px-4 md:px-12 lg:px-24 text-white">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold">Screenshots of our Marketplacebot</h2>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={3}
        slidesPerGroup={6}
        grid={{ rows: 2, fill: 'row' }}
        spaceBetween={30}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          0: {
            slidesPerView: 1,
            grid: { rows: 1 },
          },
          640: {
            slidesPerView: 2,
            grid: { rows: 2 },
          },
          1024: {
            slidesPerView: 3,
            grid: { rows: 2 },
          },
        }}
      >
        {screenshots.map((src, idx) => (
          <SwiperSlide key={idx}>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <img src={src} alt={`Screenshot ${idx + 1}`} className="w-full h-auto object-contain" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

export default ScreenshotCarousel
