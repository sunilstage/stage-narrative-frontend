import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { BackgroundJobsProvider } from "@/contexts/BackgroundJobsContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { Navbar } from "@/components/Navbar";
import BackgroundJobsIndicator from "@/components/BackgroundJobsIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STAGE Narrative Engine",
  description: "AI-powered narrative generation system for OTT content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <Providers>
            <ToastProvider>
              <BackgroundJobsProvider>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />

                  {/* Main Content */}
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                  </main>

                  {/* Background Jobs Indicator */}
                  <BackgroundJobsIndicator />
                </div>
              </BackgroundJobsProvider>
            </ToastProvider>
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
