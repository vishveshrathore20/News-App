const adminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const { encrypt, decrypt } = require("../utils/function"); // Import your encryption/decryption functions

const registerController = async (req, res) => {
  try {
    const existingUser = await adminModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User Already Exist",
      });
    }

    // Encrypt the password
    const encryptedPassword = encrypt(req.body.password).encryptedData;
    req.body.password = encryptedPassword;

    const user = new adminModel(req.body);
    await user.save();

    return res.status(201).send({
      success: true,
      message: "User Registered Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Register API",
      error,
    });
  }
};

const loginController = async (req, res) => {
  try {
    // Find the user by email
    const existingUser = await adminModel.findOne({ email: req.body.email });
    if (!existingUser) {
      return res.status(404).send({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Decrypt the stored password
    const decryptedPassword = decrypt(existingUser.password);

    // Compare provided password with stored decrypted password
    if (req.body.password !== decryptedPassword) {
      return res.status(404).send({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Create a JWT token with user ID and role
    const token = jwt.sign(
      { userId: existingUser._id, role: existingUser.role }, // Include role in payload
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send response with token and user information
    return res.status(200).send({
      success: true,
      message: "Login Successful",
      token,
      existingUser,
    });
  } catch (error) {
    console.error(error); // Log errors
    res.status(500).send({
      success: false,
      message: "Error in login API",
      error: error.message, // Send error message for debugging
    });
  }
};

module.exports = { registerController, loginController };
