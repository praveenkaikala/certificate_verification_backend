const express = require("express");
const router = express.Router();
const controller = require("../controllers/institute.controller");
const { instituteAuth } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");

router.get("/students", instituteAuth, controller.getAllStudents);
router.get("/students/:studentId", instituteAuth, controller.getStudentById);
router.put("/students/:studentId/verify", instituteAuth, controller.verifyStudent);
router.delete("/students/:studentId", instituteAuth, controller.removeStudent);

router.post("/certificates", instituteAuth,upload.single("certificate"), controller.issueCertificate);
router.get("/certificates", instituteAuth, controller.getIssuedCertificates);
module.exports = router;
