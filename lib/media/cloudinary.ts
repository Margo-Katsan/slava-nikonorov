import { v2 as cloudinary } from "cloudinary";
import "server-only";

export function getCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary environment variables are missing");
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  return { cloudinary, cloudName: cloud_name, apiKey: api_key, apiSecret: api_secret };
}
