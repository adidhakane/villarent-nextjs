import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/error-boundary'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "VillaRent - Book Premium Villas in Maharashtra | No Registration Required",
  description: "Book luxury villas in Lonavala, Mahabaleshwar, Alibaug & more. Instant WhatsApp booking, 4.9★ rating, trusted by 1000+ guests. No registration required!",
  keywords: ["villa rental Maharashtra", "Lonavala villas", "Mahabaleshwar villa booking", "Alibaug villa rental", "weekend getaway", "vacation rental", "premium villas", "instant booking", "WhatsApp booking"],
  openGraph: {
    title: "VillaRent - Book Premium Villas in Maharashtra",
    description: "Instant villa booking via WhatsApp. Premium villas in Maharashtra's best destinations. Trusted by 1000+ guests. No registration required!",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "VillaRent - Book Premium Villas in Maharashtra",
    description: "Instant villa booking via WhatsApp. Premium villas in Maharashtra's best destinations.",
  },
  other: {
    "google-site-verification": "your-verification-code-here",
  },
=======
  title: "Villa Rental System - Premium Villa Rentals",
  description: "Discover and book premium villas for your perfect getaway. Manage your villa rentals with ease.",
  keywords: ["villa rental", "vacation rental", "premium villas", "holiday homes"],
>>>>>>> a699f2ce85b82f4dd9192ea30d61277b19ffa3d3
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
