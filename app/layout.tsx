import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your expenses and income with this simple app",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Expense Tracker",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        {children}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                  .then(function(registration) {
                    console.log('Service Worker registration successful with scope: ', registration.scope);
                    
                    // Check for updates on page load
                    registration.update();
                    
                    // Set up periodic checks for updates
                    setInterval(() => {
                      registration.update();
                      console.log('Checking for Service Worker updates...');
                    }, 1000 * 60 * 60); // Check every hour
                  })
                  .catch(function(error) {
                    console.log('Service Worker registration failed: ', error);
                  });
              });
              
              // Listen for service worker updates
              navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Service Worker updated, reloading for fresh content');
                window.location.reload();
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
