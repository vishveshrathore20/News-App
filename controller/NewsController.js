const { uploadOnCloudnary } = require("../utils/cloudinary");
const News = require("../models/newsDataModel");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const admin = require("firebase-admin");
const { removeFilesFromCloudinary } = require("../utils/removefilescloudinary");
const AdminAuth = require("../models/adminModel");
const ObjectId = mongoose.Types.ObjectId;
// Initialize Firebase Admin SDK

const serviceAccount = require("../kahan-sandesh-52b9f-firebase-adminsdk-fje3v-7cd7f36d5e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kahan-sandesh-52b9f-default-rtdb.firebaseio.com/",
});

const createNews = async (req, res) => {
  try {
    // Initialize an array to hold all URLs
    const allUrls = [];
    const filePaths = [];

    // Collect file paths for later deletion
    for (const file of req.files) {
      filePaths.push(file.path); // Save file path
    }

    // Upload each file to Cloudinary and collect URLs
    for (const filePath of filePaths) {
      const uploadResponse = await uploadOnCloudnary(filePath);
      if (uploadResponse && uploadResponse.url) {
        allUrls.push(uploadResponse.url);
      } else {
        console.log(`Failed to upload file: ${filePath}`);
      }
    }

    // Remove local files after successful upload
    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Create news item
    let news = new News({
      title: req.body.title,
      description: req.body.description,
      urls: allUrls,
      expiry_date: req.body.expiry_date,
      created_by: req.user.userId,
    });

    // Save news item to the database
    news = await news.save();

    // Populate the created_by field with the full Admin data
    news = await news.populate("created_by");

    // Extract the first URL to be used in the notification
    const imageUrl = allUrls.length > 0 ? allUrls[0] : "";

    // Send push notification
    const message = {
      notification: {
        title: req.body.title,
        // body: req.body.description,
        image: imageUrl,
      },
      topic: "news", // Replace with your specific topic if needed
    };

    admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log("Push notification sent successfully:", response);
      })
      .catch((error) => {
        console.error("Error sending push notification:", error);
      });

    // Send the populated news item in the response
    res.status(201).json(news);
  } catch (error) {
    console.error("Error creating news:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getallnews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 25;
    const skip = (page - 1) * limit;

    const adminId = req.query.adminId;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    let query = {};

    // Filter by adminId if provided
    if (adminId) {
      // Validate adminId format
      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        return res.status(400).json({ message: "Invalid adminId format" });
      }
      query.created_by = new mongoose.Types.ObjectId(adminId); // Correctly instantiate ObjectId
    }

    // Add date range filtering if both dates are provided
    if (startDate && endDate) {
      endDate.setHours(23, 59, 59, 999); // Include the entire end day
      query.created_at = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      startDate.setHours(0, 0, 0, 0); // Start from the beginning of the day
      query.created_at = { $gte: startDate };
    } else if (endDate) {
      endDate.setHours(23, 59, 59, 999); // Include the entire end day
      query.created_at = { $lte: endDate };
    }

    const news = await News.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .populate("created_by", "name email mobile role status")
      .populate("updatedby", " email mobile role status");

    if (news.length === 0) {
      return res.status(404).json({ message: "No news found" });
    }

    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const { id } = req.params; // ID of the news to update
    const { title, description, deleteUrls } = req.body;
    const adminId = req.user.userId; // Get the admin ID from the request

    const newsItem = await News.findById(id);

    if (!newsItem) {
      return res.status(404).json({ message: "News not found" });
    }

    // Remove specified old files from Cloudinary and database
    if (deleteUrls && deleteUrls.length > 0) {
      console.log("Deleting files:", deleteUrls);
      await removeFilesFromCloudinary(deleteUrls);
      newsItem.urls = newsItem.urls.filter((url) => !deleteUrls.includes(url)); // Remove URLs from the database
    }

    // Upload new files to Cloudinary and get URLs
    let newUrls = [];
    if (req.files && req.files.length > 0) {
      console.log("Files to upload:", req.files);
      const uploadPromises = req.files.map(async (file) => {
        const response = await uploadOnCloudnary(file.path); // Upload each file
        if (response) {
          // Remove the local file after uploading
          fs.unlinkSync(file.path);
          console.log("Removed local file:", file.path);
        }
        return response;
      });

      const responses = await Promise.all(uploadPromises);
      newUrls = responses
        .filter((response) => response !== null)
        .map((response) => response.url);
      newsItem.urls = [...newsItem.urls, ...newUrls]; // Add new URLs to the existing list
    }

    // Update the news item
    newsItem.title = title || newsItem.title;
    newsItem.description = description || newsItem.description;
    newsItem.updatedby = adminId; // Set the admin ID who is updating the news

    await newsItem.save();

    // Populate the `updatedby` field with admin details
    const updatedNewsItem = await News.findById(id).populate(
      "updatedby",
      "name email role"
    ); // Specify fields to populate

    // Send response with updated news item
    res.status(200).json({
      message: "News updated successfully",
      newsItem: updatedNewsItem, // Return the populated news item
    });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const updateNews = async (req, res) => {
//   try {
//     const { id } = req.params; // ID of the news to update
//     const { title, description, deleteUrls } = req.body;
//     const adminId = req.user.userId; // Get the admin ID from the request

//     const newsItem = await News.findById(id);

//     if (!newsItem) {
//       return res.status(404).json({ message: "News not found" });
//     }

//     // Remove specified old files from Cloudinary and database
//     if (deleteUrls && deleteUrls.length > 0) {
//       console.log("Deleting files:", deleteUrls);
//       await removeFilesFromCloudinary(deleteUrls);
//       newsItem.urls = newsItem.urls.filter((url) => !deleteUrls.includes(url)); // Remove URLs from the database
//     }

//     // Upload new files to Cloudinary and get URLs
//     let newUrls = [];
//     if (req.files && req.files.length > 0) {
//       console.log("Files to upload:", req.files);
//       const uploadPromises = req.files.map(async (file) => {
//         const response = await uploadOnCloudnary(file.path); // Upload each file
//         if (response) {
//           // Remove the local file after uploading
//           fs.unlinkSync(file.path);
//           console.log("Removed local file:", file.path);
//         }
//         return response;
//       });

//       const responses = await Promise.all(uploadPromises);
//       newUrls = responses
//         .filter((response) => response !== null)
//         .map((response) => response.url);
//       newsItem.urls = [...newsItem.urls, ...newUrls]; // Add new URLs to the existing list
//     }

//     // Update the news item
//     newsItem.title = title || newsItem.title;
//     newsItem.description = description || newsItem.description;
//     newsItem.updatedby = adminId; // Set the admin ID who is updating the news

//     await newsItem.save();

//     // Send response with updated news item
//     res.status(200).json({
//       message: "News updated successfully",
//       newsItem: {
//         ...newsItem._doc, // Spread the newsItem object to include all fields
//         updatedby: adminId, // Include updatedby field in the response
//       },
//     });
//   } catch (error) {
//     console.error("Error updating news:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "News item not found" });
    }

    // Delete all files from Cloudinary
    for (const url of news.urls) {
      const publicId = url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await News.findByIdAndDelete(id);
    res.status(200).json({ message: "News item deleted successfully" });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNews,
  getallnews,
  updateNews,
  deleteNews,
};
