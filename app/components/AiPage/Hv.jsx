// app/consultancy/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function ConsultancyPage() {
  return (
    <section className="py-10 px-4 md:px-12 lg:px-24 flex flex-col items-center">
  
      <h2 className="text-3xl md:text-4xl font-bold text-black lg:mb-32 mb-12">
        Our Consultancy Firm
      </h2>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-20 max-w-5xl mx-auto">
        
        <div className="flex flex-col items-center md:items-center text-center md:text-left">
          <Image
            src="/hv.webp"
            alt="Hv Technologies Logo"
            width={300}
            height={300}
            className="mb-3"
          />
          <p className="font-handwriting text-xl">Hv Technologies</p>
        </div>


        <div className="flex-1 text-center md:text-left">
          <p className="text-gray-800 leading-relaxed">
            <span className="font-semibold">MOBILE + WEB INNOVATORS.</span>
            <br />
            Get any kind of app, website or ai automations developed. We
            have a good experience in developing different domains. We have developed and deployed 200+
            apps, websites and ai automations for our clients in 20+ Countries.
          </p>
        </div>
      </div>

      {/* Button */}
      <div className="mt-12">
        <Link
          href="https://hvtechnologies.app/"
          target="_blank"
          className="bg-black text-white px-4 py-1 rounded-md shadow-md hover:bg-black/70 transition flex items-center gap-2"
        >
          Visit Website{" "}
          <span className="text-lg" aria-hidden="true">
            ↗
          </span>
        </Link>
      </div>
    </section>
  );
}
