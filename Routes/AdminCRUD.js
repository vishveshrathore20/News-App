const express = require("express");
const NewAdmin = require("../controller/AdminsControllerCRUD");
const verifyToken = require("../middleware/checkJwtToken");
const checkMasterAdmin = require("../middleware/isMasterAdmin");
const router = express.Router();

// Import controllers
router.post("/add-admin", verifyToken, checkMasterAdmin, NewAdmin.addNewAdmin);
router.get("/allAdmins", verifyToken, checkMasterAdmin, NewAdmin.getAllAdmins);

//this is used to bring all admin with password visible (Original password)
router.get(
  "/getAdminData/:id",
  verifyToken,
  checkMasterAdmin,
  NewAdmin.getAdminById
);

router.get(
  "/getAllAdminswithoutpagination",
  verifyToken,
  checkMasterAdmin,
  NewAdmin.getAllAdminswithoutpagination
);
router.put(
  "/updateAdmin/:id",
  verifyToken,
  checkMasterAdmin,
  NewAdmin.updateAdminData
);

module.exports = router;
