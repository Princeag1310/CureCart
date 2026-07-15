import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/config/db";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Pen, ShoppingBag, Shield } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Fetch full user to get latest address details
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) redirect("/login");

  const fullAddress = [user.address, user.city, user.state, user.zipCode].filter(Boolean).join(", ");

  return (
    <main className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="bg-zinc-900 h-40 w-full relative">
            <div className="absolute inset-0 bg-dot-pattern-white opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <Link 
              href="/profile/edit"
              className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 border border-white/10"
            >
              <Pen className="w-4 h-4" /> Edit Profile
            </Link>
          </div>
          <div className="px-8 pb-10 relative">
            <div className="absolute -top-14 left-8 border-4 border-white rounded-full bg-white overflow-hidden h-28 w-28 shadow-xl">
              {user.image ? (
                user.image.startsWith('data:image') ? (
                  <img src={user.image} alt={user.name || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  <Image src={user.image} alt={user.name || "Profile"} fill className="object-cover" />
                )
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-emerald-100 to-zinc-100 flex items-center justify-center text-emerald-600 text-3xl font-black">
                  {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="pt-20">
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{user.name || "CureCart User"}</h1>
              <p className="text-zinc-500 font-medium mt-1">{user.email}</p>
              
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest border border-emerald-100">
                <Shield className="w-3 h-3" />
                {user.role} ACCOUNT
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Account Details</h2>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Phone Number</p>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">{user.phone || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Shipping Address</p>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">
                    {fullAddress || "No shipping address saved."}
                  </p>
                </div>
              </div>
            </div>

            {(!user.phone || !user.address) && (
              <div className="bg-amber-50 text-amber-700 p-5 rounded-2xl text-sm font-medium border border-amber-100">
                <p className="font-bold">Complete your profile for seamless checkout</p>
                <Link href="/profile/edit" className="font-black underline mt-2 block text-amber-800 hover:text-amber-900 transition-colors">Add Details →</Link>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center items-center text-center group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-zinc-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="font-black text-zinc-900 text-lg">Your Orders</h3>
            <p className="text-sm text-zinc-500 font-medium mt-2 mb-6 max-w-[200px]">View and track your previous medical orders.</p>
            <Link href="/orders" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors px-6 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100">
              View Order History →
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
