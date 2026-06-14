'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/actions/profile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function EditProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    if (imagePreview) {
      formData.set('image', imagePreview);
    }
    
    const result = await updateProfile(formData);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/profile');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-5">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-zinc-100 bg-zinc-50 flex items-center justify-center shadow-lg group">
          {imagePreview ? (
            <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-zinc-100 flex items-center justify-center">
              <span className="text-emerald-500 text-sm font-bold">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Change</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="imageUpload" className="cursor-pointer text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-5 py-2.5 rounded-full transition-all hover:bg-emerald-100 hover:scale-105">
            Change Photo
          </label>
          <input 
            id="imageUpload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageChange}
          />
          {imagePreview && imagePreview !== user.image && (
            <button 
              type="button" 
              onClick={() => setImagePreview(user.image || null)}
              className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 px-5 py-2.5 rounded-full transition-all hover:bg-red-100"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-bold text-gray-700">Full Name</label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={user.name || ''} 
          placeholder="e.g. John Doe"
          className="rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 h-auto shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-bold text-zinc-700">Phone Number</label>
        <Input 
          id="phone" 
          name="phone" 
          defaultValue={user.phone || ''} 
          placeholder="e.g. +91 9876543210"
          className="rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 h-auto shadow-sm"
        />
      </div>

      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent"></div>
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Shipping Address</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent"></div>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-bold text-zinc-700">Street Address</label>
            <Input 
              id="address" 
              name="address" 
              defaultValue={user.address || ''} 
              placeholder="123 Main St, Apt 4B"
              className="rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 h-auto shadow-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-bold text-zinc-700">City</label>
              <Input 
                id="city" 
                name="city" 
                defaultValue={user.city || ''} 
                className="rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 h-auto shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-bold text-zinc-700">State</label>
              <Input 
                id="state" 
                name="state" 
                defaultValue={user.state || ''} 
                className="rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 h-auto shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="zipCode" className="text-sm font-bold text-zinc-700">ZIP / Postal Code</label>
            <Input 
              id="zipCode" 
              name="zipCode" 
              defaultValue={user.zipCode || ''} 
              className="rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 h-auto shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/profile')}
          className="rounded-xl flex-1 py-4 h-auto text-sm font-bold border-zinc-200 hover:bg-zinc-50 transition-all"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="rounded-xl flex-1 py-4 h-auto text-sm font-bold bg-zinc-900 hover:bg-emerald-600 shadow-sm transition-colors border-0 disabled:opacity-50 text-white"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
