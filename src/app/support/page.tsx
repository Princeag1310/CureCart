import { Mail, Phone, MessageCircle, FileQuestion, ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  const faqs = [
    {
      q: "How does the AI prescription verification work?",
      a: "When you upload a prescription, our AI engine securely extracts the text, verifies the doctor's registration, and checks the prescribed medicines against our database to prevent errors."
    },
    {
      q: "How fast is delivery?",
      a: "We offer 2-hour express delivery in select metro areas, and standard next-day delivery nationwide."
    },
    {
      q: "Are my medical records secure?",
      a: "Absolutely. CureCart uses end-to-end encryption for all medical records and complies with HIPAA and local data protection regulations."
    },
    {
      q: "Can I cancel my order?",
      a: "Orders can be canceled within 30 minutes of placement. Once an order is processed by our fulfillment center, it cannot be canceled."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {/* Header */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            How can we help you?
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            We're here to support you with orders, prescriptions, and any questions you might have.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Chat with our support team or use our AI Assistant for instant help.</p>
            <Button className="w-full rounded-xl font-bold bg-blue-600 hover:bg-blue-700 py-6 h-auto">Start Chat</Button>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Call us directly. We are available Mon-Fri, 9am to 8pm EST.</p>
            <p className="text-2xl font-black text-gray-900">+1 (800) 123-4567</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Us</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Send us an email and we'll get back to you within 24 hours.</p>
            <p className="text-sm font-bold text-gray-900">support@curecart.example.com</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                <FileQuestion className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="group p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-100 transition-colors cursor-pointer">
                  <div className="flex justify-between items-center gap-4">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{faq.q}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors shrink-0" />
                  </div>
                  <p className="mt-3 text-sm text-gray-600 font-medium leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <p className="text-emerald-800 font-bold mb-2">Still need help?</p>
              <p className="text-sm text-emerald-600/80 font-medium mb-4">Our AI Health Assistant can answer complex queries instantly.</p>
              <Button className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700">Ask AI Assistant</Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
