import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 w-full"></div>
          <div className="px-8 pb-8 relative">
            <div className="absolute -top-12 left-8 border-4 border-white rounded-full bg-white overflow-hidden h-24 w-24">
              {user.image ? (
                <Image src={user.image} alt={user.name || "Profile"} fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl font-bold">
                  {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="pt-16">
              <h1 className="text-2xl font-bold text-gray-900">{user.name || "CureCart User"}</h1>
              <p className="text-gray-500">{user.email}</p>
              
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                {user.role} ACCOUNT
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats / Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Authentication</span>
                <span className="font-medium text-gray-900">
                  {user.image ? "Google OAuth" : "Email / Password"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Your Orders</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">View and track your previous medical orders.</p>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View Order History &rarr;
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
