import { FaDownload, FaCogs, FaRocket, FaChartLine } from 'react-icons/fa'

const HowItWorks = () => {
  const steps = [
    {
      id: '01',
      icon: <FaDownload className="text-white text-2xl" />,
      title: 'Install Chrome Extension',
      description: 'Download and install our secure chrome from the official store',
    },
    {
      id: '02',
      icon: <FaCogs className="text-white  text-2xl" />,
      title: 'Configure your bot',
      description: 'Set your automated responses and conversation preferences in minutes',
    },
    {
      id: '03',
      icon: <FaRocket className="text-white text-2xl" />,
      title: 'Activate Automation',
      description: 'Turn on the bot and watch it engage with customers',
    },
    {
      id: '04',
      icon: <FaChartLine className="text-white  text-2xl" />,
      title: 'Watch Sales Grow',
      description: 'Enjoy increased sales',
    },
  ]

  return (
    <section className="py-10 px-4 md:px-12 lg:px-24 text-black ">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">How It Works</h2>
        <p className="text-black">Get started in minutes with our simple process</p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-10">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center space-y-4 relative"
          >
            {/* Horizontal line behind the icon */}
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-black to-black/80 transform -translate-y-1/2 z-0" />
              <div className="bg-gradient-to-r from-black to-black/80 rounded-full w-20 h-20 flex items-center justify-center z-10">
                {step.icon}
              </div>
            </div>

            <div className="bg-black/10 text-black  font-semibold px-3 py-1 rounded-md text-sm">
              {step.id}
            </div>

            <h3 className="font-bold text-lg">{step.title}</h3>
            <p className="text-sm text-black">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
