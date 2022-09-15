// Require the Cloudinary library
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const uploadPicture = (content: Buffer): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result!);
          }
        }
      )
      .end(content);
  });
};

export const genCloudinaryRequest = async () => {
  const url = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`;
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await cloudinary.utils.api_sign_request(
    { timestamp, upload_preset: "cedula" },
    process.env.CLOUDINARY_API_SECRET!
  );
  const api_key = process.env.CLOUDINARY_API_KEY;

  return {
    url,
    timestamp,
    signature,
    api_key,
  };
};
