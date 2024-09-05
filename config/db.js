const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async (mongoDbURL) => {
  try {
    await mongoose.connect(mongoDbURL);

    console.log(
      `Connected to database ${mongoose.connection.host}`.bgRed.white
    );
  } catch (error) {
    console.log(`MongoDB Database error ${error}`.bgRed.white);
  }
};

module.exports = connectDB;
