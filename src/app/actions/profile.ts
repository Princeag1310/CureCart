'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { prisma } from "@/config/db";
import { revalidatePath } from "next/cache";
import { ImageKitService } from "@/services/imagekit.service";

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zipCode = formData.get("zipCode") as string;
  const newImageBase64 = formData.get("image") as string;

  try {
    // 1. Fetch current user to check for existing image
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    let finalImageUrl = currentUser?.image;

    // 2. Process new image upload if provided
    if (newImageBase64 && newImageBase64.startsWith('data:image')) {
      // First, delete the old image from ImageKit to save space
      if (currentUser?.image && currentUser.image.includes('ik.imagekit.io')) {
        await ImageKitService.deleteImageByUrl(currentUser.image);
      }

      // Then upload the new one
      const cleanBase64 = newImageBase64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      finalImageUrl = await ImageKitService.uploadImage(
        cleanBase64, 
        '/curecart_profiles', 
        `profile_${currentUser?.id || 'new'}`
      );
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        image: finalImageUrl || null,
      }
    });

    revalidatePath("/profile");
    revalidatePath("/checkout");
    
    return { success: true };
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return { error: error.message || "Failed to update profile" };
  }
}
