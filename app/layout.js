import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ToastProvider } from "./components/toast-provider";
import "react-phone-input-2/lib/style.css";
import "react-datepicker/dist/react-datepicker.css";
import Script from 'next/script';
import FirebaseAnalyticsClient from "./components/FirebaseAnalyticsClient"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

<Script src="https://www.google.com/recaptcha/api.js" />


export const metadata = {
  title: "Ai Chatbot",
  description: "Generate unlimited leads using facebook marketplace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <Providers>
        {children}
        </Providers>
        <ToastProvider/>
         <FirebaseAnalyticsClient />
          <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
         <Script
          id="meta-pixel-base"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '2188328991642135');
              fbq('track', 'PageView');
            `,
          }}
        />

        {/* noscript fallback (pixel image) */}
        <noscript dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none"
            src="https://www.facebook.com/tr?id=2188328991642135&ev=PageView&noscript=1" />`
        }} />

      </body>
    </html>
  );
}
