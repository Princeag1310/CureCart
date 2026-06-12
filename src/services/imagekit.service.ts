import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "dummy",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "dummy",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "dummy"
});

export class ImageKitService {
  /**
   * Uploads a base64 encoded image to ImageKit
   * @param base64Image The base64 string
   * @param folder The folder to upload to (e.g., '/curecart_profiles')
   * @param fileName The desired filename (e.g., 'profile_123.jpg')
   * @returns The public URL of the uploaded image
   */
  static async uploadImage(base64Image: string, folder: string, fileName: string): Promise<string> {
    if (process.env.IMAGEKIT_PUBLIC_KEY === "dummy") {
      console.warn("ImageKit keys missing, skipping actual upload and returning placeholder");
      return "https://ik.imagekit.io/demo/img/sample.jpg";
    }

    try {
      const response = await imagekit.upload({
        file: base64Image,
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true // Adds unique characters to avoid cache issues
      });
      return response.url;
    } catch (error) {
      console.error("ImageKit Upload Error:", error);
      throw new Error("Failed to upload image to ImageKit");
    }
  }

  /**
   * Deletes an image from ImageKit given its URL
   * @param imageUrl The full ImageKit URL
   */
  static async deleteImageByUrl(imageUrl: string): Promise<boolean> {
    if (process.env.IMAGEKIT_PUBLIC_KEY === "dummy" || !imageUrl.includes("ik.imagekit.io")) {
      return false; // Skip if dummy or not an ImageKit URL
    }

    try {
      // Extract the filename from the URL
      // E.g. https://ik.imagekit.io/your_id/curecart_profiles/profile_123_abc.jpg -> profile_123_abc.jpg
      const urlParts = new URL(imageUrl).pathname.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Search for the file to get its fileId
      const files = await imagekit.listFiles({
        searchQuery: `name="${fileName}"`
      });

      if (files && files.length > 0) {
        // ImageKit listFiles can return FolderObject or FileObject
        const fileObj = files.find((f: any) => f.type === 'file' || f.fileId) as any;
        if (fileObj && fileObj.fileId) {
          await imagekit.deleteFile(fileObj.fileId);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("ImageKit Delete Error:", error);
      return false; // Don't throw, we just want to fail silently for deletes
    }
  }
}
