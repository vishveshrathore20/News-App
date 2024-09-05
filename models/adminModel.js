const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    // match: [
    //   /^[A-Za-z\s]+$/,
    //   "Name can only contain alphabetic characters and spaces",
    // ],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^(?=.*[@]).+$/,
      'Invalid email format. Email must contain an "@" symbol and at least one digit.',
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: [1, "Password must be at least 8 characters long"],
    maxlength: [60, "Password cannot be more than 60 characters long"],
  },
  mobile: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid Indian mobile number!`,
    },
    length: [10, "Mobile number should be exactly 10 digits long"],
    unique: true,
  },
  role: {
    type: String,
    enum: ["MasterAdmin", "Admin"],
  },
  status: {
    type: String,
    enum: ["Enabled", "Disabled"],
  },
});

const adminAuth = mongoose.model("AdminAuth", adminSchema);

module.exports = adminAuth;
