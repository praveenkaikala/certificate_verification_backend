const express = require("express");
const router = express.Router();
const controller = require("../controllers/student.controller");
const { studentAuth } = require("../middleware/auth.middleware");

router.get("/stats", studentAuth, controller.getStats);
router.get("/certificates", studentAuth, controller.getCertificates);
router.get("/certificates/:certificateId", studentAuth, controller.getCertificate);

module.exports = router;
