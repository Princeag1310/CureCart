import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, HeartPulse } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300 pt-20 pb-10 mt-auto border-t border-emerald-900/30 relative overflow-hidden shrink-0">
      {/* Background aesthetic */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">CureCart</span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              Your trusted AI-powered digital pharmacy. We use advanced technology and verified medical data to provide the safest healthcare experience.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              Quick Links
              <span className="w-8 h-1 bg-emerald-600 rounded-full block mt-1"></span>
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-zinc-400 hover:text-emerald-400 hover:translate-x-1 inline-block transition-all text-sm font-medium">Shop Medicines</Link>
              </li>
              <li>
                <Link href="/ai-search" className="text-zinc-400 hover:text-emerald-400 hover:translate-x-1 inline-block transition-all text-sm font-medium">AI Health Assistant</Link>
              </li>
              <li>
                <Link href="/about" className="text-zinc-400 hover:text-emerald-400 hover:translate-x-1 inline-block transition-all text-sm font-medium">About Us</Link>
              </li>
              <li>
                <Link href="/support" className="text-zinc-400 hover:text-emerald-400 hover:translate-x-1 inline-block transition-all text-sm font-medium">Help & Support</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              Categories
              <span className="w-8 h-1 bg-emerald-600 rounded-full block mt-1"></span>
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/?category=prescription" className="text-zinc-400 hover:text-emerald-400 hover:translate-x-1 inline-block transition-all text-sm font-medium">Prescription Drugs</Link>
              </li>
              <li>
                <Link href="/?category=otc" className="text-zinc-400 hover:text-emerald-400 hover:translate-x-1 inline-block transition-all text-sm font-medium">Over-The-Counter</Link>
              </li>
              <li>
                <Link href="/lab-tests" className="text-zinc-400 hover:text-emerald-400 hover:translate-x-1 inline-block transition-all text-sm font-medium">Lab Tests & Checkups</Link>
              </li>
              <li>
                <Link href="/consult" className="text-zinc-400 hover:text-emerald-400 hover:translate-x-1 inline-block transition-all text-sm font-medium">Online Consultations</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              Contact Us
              <span className="w-8 h-1 bg-emerald-600 rounded-full block mt-1"></span>
            </h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500 shrink-0 group-hover:bg-emerald-900/50 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Location</p>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">123 Health Avenue, Medical District<br />New York, NY 10001</p>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500 shrink-0 group-hover:bg-emerald-900/50 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Call Us</p>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">+1 (800) 123-4567<br />Mon-Fri, 9am - 8pm EST</p>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500 shrink-0 group-hover:bg-emerald-900/50 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Email</p>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">support@curecart.example.com</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs font-medium">
            © {new Date().getFullYear()} CureCart AI Pharmacy. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-medium text-zinc-500">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
            <Link href="/refunds" className="hover:text-emerald-400 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
