const express = require("express");
const {
  createNews,
  getallnews,
  updateNews,
  deleteNews,
} = require("../controller/NewsController");
const { upload } = require("../middleware/multer");
const verifyToken = require("../middleware/checkJwtToken");
const router = express.Router();

// Route to add news with file upload
router.post("/addNews", verifyToken, upload.array("files"), createNews);

router.get("/getallnews", verifyToken, getallnews);
router.get("/getallnews/notoken", getallnews);
router.put("/update/:id", verifyToken, upload.array("localFiles"), updateNews);
router.delete("/delete/:id", verifyToken, deleteNews);

module.exports = router;
