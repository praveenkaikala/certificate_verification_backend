const express = require("express");
const router = express.Router();
const adminInstituteController = require("../controllers/admin.controller");
const { adminAuth } = require("../middleware/auth.middleware");

router.get("/institutes", adminAuth, adminInstituteController.getInstitutes);
router.get("/institutes/:instituteId", adminAuth, adminInstituteController.getInstituteById);
router.put("/institutes/:instituteId/verify", adminAuth, adminInstituteController.verifyInstitute);
router.delete("/institutes/:instituteId", adminAuth, adminInstituteController.deleteInstitute);
router.get("/stats",adminAuth,adminInstituteController.getStats)
module.exports = router;