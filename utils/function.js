const crypto = require("crypto");
const {
  ENCRYPTION_SECRET,
  ENCRYPTION_SECRET_VI,
} = require("../config/confirugation");

function encrypt(text) {
  const secretKeyBuffer = Buffer.from(ENCRYPTION_SECRET, "hex");
  const iv = Buffer.from(ENCRYPTION_SECRET_VI, "hex");

  const cipher = crypto.createCipheriv("aes-256-cbc", secretKeyBuffer, iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return { encryptedData: encrypted };
}

function decrypt(encryptedText) {
  const secretKeyBuffer = Buffer.from(ENCRYPTION_SECRET, "hex");
  const iv = Buffer.from(ENCRYPTION_SECRET_VI, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", secretKeyBuffer, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

module.exports = { encrypt, decrypt };
