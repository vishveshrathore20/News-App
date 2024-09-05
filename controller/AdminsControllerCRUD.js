const express = require("express");
const adminAuth = require("../models/adminModel");
const app = express();
const { encrypt, decrypt } = require("../utils/function");

app.use(express.json());

const addNewAdmin = async (req, res) => {
  try {
    const { name, email, password, mobile, role, status } = req.body;

    if (!name || !email || !password || !mobile || !role || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await adminAuth.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const encryptedPassword = encrypt(password).encryptedData;

    const newAdmin = new adminAuth({
      name,
      email,
      password: encryptedPassword,
      mobile,
      role,
      status,
    });

    await newAdmin.save();

    res
      .status(201)
      .json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    console.error("Error adding new admin:", error);

    // Send a more detailed error message
    res.status(500).json({
      message: "Failed to add new admin",
      error: error.message || "Internal server error",
    });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = { role: "Admin" };

    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: "i" };
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const admins = await adminAuth.find(query).skip(skip).limit(limit);

    const adminsWithDecryptedPasswords = admins.map((admin) => {
      try {
        const decryptedPassword = decrypt(admin.password);
        return {
          ...admin.toObject(),
          password: decryptedPassword,
        };
      } catch (err) {
        console.error(`Error decrypting password for admin ${admin._id}:`, err);
        return {
          ...admin.toObject(),
          password: null,
        };
      }
    });

    const totalAdmins = await adminAuth.countDocuments(query);

    res.status(200).json({
      admins: adminsWithDecryptedPasswords,
      pagination: {
        totalAdmins,
        totalPages: Math.ceil(totalAdmins / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching admins:", error);

    res.status(500).json({
      message: "Failed to fetch admins",
      error: error.message || "Internal server error",
    });
  }
};

const updateAdminData = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingAdmin = await adminAuth.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (updateData.password) {
      try {
        updateData.password = encrypt(updateData.password).encryptedData;
      } catch (encryptError) {
        console.error("Error during password encryption:", encryptError);
        return res.status(500).json({
          message: "Failed to encrypt password",
          error: encryptError.message,
        });
      }
    }

    for (const key in updateData) {
      existingAdmin[key] = updateData[key];
    }

    try {
      const updatedAdmin = await existingAdmin.save();
      res.status(200).json({
        message: "Admin updated successfully",
        admin: updatedAdmin,
      });
    } catch (saveError) {
      console.error("Error saving admin data:", saveError);
      return res.status(500).json({
        message: "Failed to update admin data",
        error: saveError.message,
      });
    }
  } catch (error) {
    console.error("Error updating admin:", error);

    res.status(500).json({
      message: "Failed to update admin",
      error: error.message || "Internal server error",
    });
  }
};

const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await adminAuth.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.password) {
      try {
        admin.password = decrypt(admin.password);
      } catch (err) {
        console.error(`Error decrypting password for admin ${admin._id}:`, err);
        admin.password = null;
      }
    }

    res.status(200).json({ admin });
  } catch (error) {
    console.error("Error fetching admin data:", error);

    res.status(500).json({
      message: "Failed to fetch admin",
      error: error.message || "Internal server error",
    });
  }
};

const getAllAdminswithoutpagination = async (req, res) => {
  try {
    const query = { role: "Admin" };

    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: "i" };
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const admins = await adminAuth.find(query).select("id name");

    const adminsWithDecryptedPasswords = admins.map((admin) => {
      try {
        return {
          ...admin.toObject(),
        };
      } catch (err) {
        console.error(`Error decrypting password for admin ${admin._id}:`, err);
        return {
          ...admin.toObject(),
          password: null,
        };
      }
    });

    res.status(200).json({
      admins: adminsWithDecryptedPasswords,
    });
  } catch (error) {
    console.error("Error fetching admins:", error);

    res.status(500).json({
      message: "Failed to fetch admins",
      error: error.message || "Internal server error",
    });
  }
};

module.exports = {
  addNewAdmin,
  getAllAdmins,
  updateAdminData,
  getAdminById,
  getAllAdminswithoutpagination,
};
