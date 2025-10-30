import React from "react";

const HowToUsePage = () => {
  return (
    <div className="min-h-screen bg-white  px-4 py-8 flex flex-col items-center space-y-12">
      {/* Steps Section */}
      <section className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          How to Use
        </h1>
        <ol className="list-decimal list-inside space-y-4 text-gray-700 text-lg">
          <li>Sign up or log in to your account.</li>
          <li>Choose a subscription plan that suits your needs.</li>
          <li>Access your dashboard and start exploring features.</li>
          <li>Follow the video tutorial below for a step-by-step guide.</li>
        </ol>
      </section>

      {/* Video Tutorial Section */}
      <section className="w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Video Tutorial
        </h2>
        <video
          className="w-full h-[50vh] rounded-xl shadow-lg mt-10 border border-gray-200"
          controls
          src="/tutorial.mp4" // Place your video inside /public folder
          poster="/video-poster.png" // Optional thumbnail image
        >
          Your browser does not support the video tag.
        </video>
      </section>
    </div>
  );
};

export default HowToUsePage;
