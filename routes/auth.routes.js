const express=require("express")
const { loginAdmin, loginInstitute, loginStudent, verifyOtp, registerStudent, registerInstitute } = require("../controllers/auth.controllers")
const { adminAuth } = require("../middleware/auth.middleware")


const router=express.Router()

router.post("/admin/login",loginAdmin)
router.post("/institute/login",loginInstitute)
router.post("/student/login",loginStudent)
router.post("/student/register",registerStudent)
router.post("/institute/register",registerInstitute)
router.post("/verify/otp",verifyOtp)
module.exports=router