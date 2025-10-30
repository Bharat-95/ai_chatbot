"use client"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useRouter } from 'next/navigation'
import React from 'react'
import { Quote } from 'lucide-react';

const testimonials2 = [
    {
    message: "This chatbot is a game-changer! I used to spend hours replying to 'Is this available?' messages and then trying to get a phone number. Now, the bot does it all for me, and the leads are automatically added to my CRM. I've tripled the number of qualified leads I get from Marketplace, and the 2-day trial was all I needed to be convinced.",
    name: "Asim Namre, Realtor",
    title: "Property Dictionary",
    image: "testimonials/pd_app_icon_circle.png", 
  },
  {
    message: "The unlimited lead generation from Facebook Marketplace is exactly what I needed to scale my business. The bot handles all the initial conversations, and I only have to follow up with people who are actually serious. The monthly plan is incredibly affordable for the value it provides, especially with the AI calling feature.",
    name: "Jesicca, Realtor & Furniture Flipper",
    title: "Allure Firm",
    image: "testimonials/Allure_Firm_logo.png", 
  },  
  {
    message: "I was skeptical at first, but the results speak for themselves. The chatbot engages with potential buyers, answers their initial questions, and seamlessly asks for their contact information. The Google Sheet integration is amazing for tracking everything. It’s like having an assistant who works 24/7 without a break",
    name: "Mark, Car Salesman",
    title: "Credit Cars",
    image: "testimonials/credit_cars_logo.png", 
  },  
  {
    message: "This chatbot is a lifesaver for managing rental inquiries. I used to spend my entire day answering 'Is this still available?' messages. Now, the bot handles it all, asking for contact info and pushing it directly to my CRM. The amount of time and effort it has saved me is immense.",
    name: "Musa, Real Estate Agent",
    title: "Hola Home",
    image: "testimonials/holahome.png", 
  },
  {
    message: "An outstanding developer and manager, Hardik guided our project with precision and insight. His commitment to excellence ensured our ultimate satisfaction.",
    name: "Jacob, Used Car Dealer",
    title: "IDealer",
    image: "testimonials/iDealer_Logo.png", 
  },
  {
    message: "I've been using this chatbot for a few months, and the unlimited lead generation from Facebook Marketplace is exactly what I needed. It ensures every single lead is followed up with, and the data is captured perfectly. This bot has not only saved me time but also helped me fill vacancies much faster than before.",
    name: "Akbar, Property Manager",
    title: "Renovation For U",
    image: "testimonials/renovation_for_u.jpg", 
  },
  {
    message: "The efficiency this chatbot provides is incredible. I used to miss out on leads because I couldn't respond quickly enough to every inquiry. Now, the bot replies instantly, qualifies the lead, and even asks for their phone number. The 2-day free trial was all it took for me to see the value, and I'm now closing more deals than ever.",
    name: "Ashiq Alli",
    title: "Sign N Drive, Car Dealership",
    image: "testimonials/snd_circle.png", 
  },  
];


const Testimonials = () => {
  const router = useRouter()
  return (
    <div className="mx-auto max-w-7xl px-6 w-full pb-10 pt-10 overflow-hidden">
     <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Testimonials</h2>
        <p className="text-black">Get started in minutes with our simple process</p>
      </div>
      <Swiper 
        slidesPerView={1}
        spaceBetween={30}
        loop={true}
        autoplay={{
          delay: 3000, 
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={false}
        modules={[Pagination, Navigation, Autoplay]}
        className="px-20 py-30 mt-10"
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {testimonials2.map((testimonial, index) => (
          <SwiperSlide key={index}>
            <div className="bg-gradient-to-b to-black/70 from-black mb-12 p-6 rounded-lg shadow-lg h-full min-h-[350px] flex flex-col justify-between">
              <div className='flex justify-end '><Quote className='text-white' size={30}/></div>
              <p className="text-sm md:text-base mb-4 text-white leading-relaxed">
                {testimonial.message}
              </p>
              <div className="flex items-center mt-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.title}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <style jsx global>{`
  .swiper-pagination-bullet {
    background-color: black 
    opacity: 0.5;
    transition: all 0.3s ease;
  }

  .swiper-pagination-bullet-active {
    background-color:black !important; /* active dot */
    opacity: 1;
    transform: scale(1.3);
    
  }
`}</style>

    </div>
  )
}

export default Testimonials;