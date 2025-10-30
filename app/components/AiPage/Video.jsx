import React from 'react';

const Video = () => {
  return (
    <div className="w-full max-w-6xl lg:py-16 md:py-10 pb-20 pt-10 mx-auto p-4 ">
      <video
        controls
        className="w-full rounded-lg shadow-lg  border-1"
        poster="/video-thumbnail.jpg"
      >
        <source src="/FB Marketplace Chatbot - Full Demo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Video;
