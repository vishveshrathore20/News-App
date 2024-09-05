const removeFilesFromCloudinary = async (urls) => {
  try {
    const deletePromises = urls.map(async (url) => {
      const publicId = url.split("/").pop().split(".")[0]; // Extract public ID from the URL
      return await cloudinary.uploader.destroy(publicId);
    });
    const results = await Promise.all(deletePromises);
    console.log("Files deleted from Cloudinary:", results);
  } catch (error) {
    console.error("Error deleting files from Cloudinary:", error);
  }
};

module.exports = { removeFilesFromCloudinary };
