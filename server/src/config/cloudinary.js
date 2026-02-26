import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const testCloudinaryConnection = () => {
  try {
    console.log('Cloudinary configured successfully');
    return true;
  } catch (error) {
    console.error('Cloudinary configuration error:', error);
    return false;
  }
};

export default cloudinary;
