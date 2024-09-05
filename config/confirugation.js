require("dotenv").config(); // Load environment variables from .env file

// Extract ENCRYPTION_SECRET and ENCRYPTION_SECRET_VI from environment variables
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
const ENCRYPTION_SECRET_VI = process.env.ENCRYPTION_SECRET_VI;

module.exports = {
  ENCRYPTION_SECRET,
  ENCRYPTION_SECRET_VI,
};
