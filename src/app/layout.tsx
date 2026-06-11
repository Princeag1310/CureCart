import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/layout/Providers";
import { GlobalChatbot } from "@/components/ui/GlobalChatbot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CureCart - Your AI-Powered Digital Pharmacy",
  description: "CureCart is a modern, AI-powered e-commerce pharmacy. We use Google Gemini to verify prescriptions instantly and provide real-time medicine data.",
  keywords: ["Pharmacy", "Medicine Delivery", "AI Health", "Next.js E-Commerce"],
  openGraph: {
    title: "CureCart - Your AI-Powered Digital Pharmacy",
    description: "CureCart is a modern, AI-powered e-commerce pharmacy.",
    url: "https://curecart.example.com",
    siteName: "CureCart",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CureCart - Your AI-Powered Digital Pharmacy",
    description: "CureCart is a modern, AI-powered e-commerce pharmacy.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          {children}
          <GlobalChatbot />
        </Providers>
      </body>
    </html>
  );
}
