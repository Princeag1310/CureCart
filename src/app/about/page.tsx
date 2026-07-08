import { CheckCircle2, ShieldCheck, HeartPulse, Sparkles, Building2, Truck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {/* Hero Section */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
            Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Digital Pharmacy Care</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed font-medium max-w-2xl mx-auto">
            CureCart is more than an online pharmacy — it's an AI-driven healthcare platform built to verify prescriptions instantly, flag adverse drug interactions, and deliver your medications with uncompromising speed and safety.
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Why Choose CureCart?</h2>
            <p className="text-gray-500 font-medium">Engineered from the ground up for safety, speed, and intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Safety</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                Our AI health assistant draws on verified FDA and WHO data to instantly analyze symptoms and cross-check for drug interactions, keeping every order safe by design.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Prescriptions</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                Upload your prescription and our intelligent OCR engine verifies the doctor's signature and medication details in milliseconds — no waiting, no guesswork.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning-Fast Delivery</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                Our hyper-local fulfillment network gets essential medications to your doorstep in as little as two hours, wherever you are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-zinc-900 rounded-[3rem] p-12 md:p-20 text-white flex flex-col md:flex-row justify-between items-center gap-12 relative overflow-hidden">
            {/* Aesthetic Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="max-w-xl relative z-10">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Building the future of digital health.</h2>
              <p className="text-zinc-400 font-medium leading-relaxed">
                We believe access to safe, verified medication is a fundamental right. CureCart is built by a team of doctors, engineers, and AI researchers committed to making pharmacy care transparent, intelligent, and accessible to everyone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:gap-12 relative z-10 w-full md:w-auto">
              <div>
                <p className="text-5xl font-black text-emerald-400 mb-2">1M+</p>
                <p className="text-zinc-400 font-bold text-sm">Patients Served</p>
              </div>
              <div>
                <p className="text-5xl font-black text-emerald-400 mb-2">50k</p>
                <p className="text-zinc-400 font-bold text-sm">Medicines</p>
              </div>
              <div>
                <p className="text-5xl font-black text-emerald-400 mb-2">2hr</p>
                <p className="text-zinc-400 font-bold text-sm">Avg. Delivery</p>
              </div>
              <div>
                <p className="text-5xl font-black text-emerald-400 mb-2">99%</p>
                <p className="text-zinc-400 font-bold text-sm">Accuracy Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
