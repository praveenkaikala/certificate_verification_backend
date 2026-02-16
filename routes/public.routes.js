const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public.controller");

router.get("/details/:id", publicController.getCertificateDetails);

module.exports = router;