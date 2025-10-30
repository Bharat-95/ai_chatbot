import { MessageSquare, Clock, MoveUpRight, Shield } from 'lucide-react'
import { FaBolt, FaUsers } from 'react-icons/fa'

const features = [
  {
    icon: <MessageSquare className="text-black text-3xl" />,
    title: 'Intelligent Chat Responses',
    desc: 'Our chatbot uses advanced AI to understand and respond to inquiries with human-like conversation. It can answer questions, qualify leads, and smoothly ask for contact details, ensuring every conversation is productive.',
  },
  {
    icon: <Clock className="text-black text-3xl" />,
    title: '24/7 Automation',
    desc: 'Never miss a lead again! Our bot works around the clock, automatically engaging with potential buyers and collecting their data instantly, so you can focus on closing deals, not answering messages.',
  },
  {
    icon: <MoveUpRight className="text-black text-3xl" />,
    title: 'Increase Sales',
    desc: 'By automatically capturing and organizing unlimited leads, our chatbot empowers you to scale your business. It allows you to focus on the hottest prospects, leading to more conversions and revenue.',
  },
  {
    icon: <Shield className="text-black text-3xl" />,
    title: 'Safe and secure',
    desc: 'Your data is our top priority. We use secure systems to ensure all lead information collected by the chatbot, from phone numbers to personal details, is safely stored and protected.',
  },
  {
    icon: <FaBolt className="text-black text-3xl" />,
    title: 'Quick Setup',
    desc: 'Get started in minutes! Our user-friendly platform allows you to set up and deploy your chatbot on Facebook Marketplace with no technical hassle.',
  },
  {
    icon: <FaUsers className="text-black text-3xl" />,
    title: 'Customer Management',
    desc: 'All captured lead data is automatically added to a Google Sheet and your CRM. This centralized system provides a clear, organized view of all your leads, making follow-up and management effortless.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-10 px-4 md:px-12 lg:px-24 text-black">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Why choose us?</h2>
        <p className="text-lg text-black mt-3 max-w-2xl mx-auto">
          Transform your Facebook Marketplace experience with cutting-edge automation that actually works
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className=" p-6 rounded-2xl shadow-lg flex flex-col gap-4"
          >
            {feature.icon}
            <h3 className="text-lg font-bold">{feature.title}</h3>
            <p className="text-sm text-black">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}