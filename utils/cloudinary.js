const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudnary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("No file path provided.");
      return null;
    }

    if (!fs.existsSync(localFilePath)) {
      console.log("File does not exist:", localFilePath);
      return null;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const folderPath = `Kahan Sandesh/${year}/${month}/${day}`;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detects the file type (image, video, etc.)
      folder: folderPath,
    });

    console.log(`Uploaded file to Cloudinary: ${response.url}`);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        console.log("Removed local file:", localFilePath);
      } catch (fsError) {
        console.error("Error removing local file:", fsError);
      }
    }

    console.error("Error uploading file to Cloudinary:", error);
    return null;
  }
};

module.exports = { uploadOnCloudnary };
