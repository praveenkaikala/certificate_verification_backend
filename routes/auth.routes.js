const express=require("express")
const { loginAdmin, loginInstitute, loginStudent, verifyOtp } = require("../controllers/auth.controllers")


const router=express.Router()

router.post("/admin/login",loginAdmin)
router.post("/institute/login",loginInstitute)
router.post("/student/login",loginStudent)
router.post("/verify/otp",verifyOtp)
module.exports=router