const express = require("express");
const mongoose = require("mongoose");
const adminAuth = require("../models/adminModel"); // Adjust the path as needed

const app = express();

const checkMasterAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID provided" });
    }

    console.log("Checking user ID:", req.user.userId);

    const user = await adminAuth.findById(req.user.userId);
    console.log("Retrieved user:", user);

    if (!user) {
      return res.status(404).json({ message: "Unauthorized User" });
    }

    if (user.role !== "MasterAdmin") {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have access" });
    }

    next();
  } catch (error) {
    console.error("Error checking MasterAdmin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = checkMasterAdmin;
