const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    urls: {
      type: [String],
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    expiry_date: {
      type: Date,
      // required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminAuth",
      required: true,
    },
    updatedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminAuth",
      default: null,
    },
  },
  { timestamps: true }
);

newsSchema.index({ title: "text", description: "text" });

const News = mongoose.model("News", newsSchema);

module.exports = News;
