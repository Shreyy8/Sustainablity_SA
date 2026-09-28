import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "saakshi-demo";
  const apiKey = process.env.CLOUDINARY_API_KEY || "mock-api-key";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "mock-api-secret";

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  return cloudinary;
}

export const cld = configureCloudinary();
