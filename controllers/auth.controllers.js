const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateOtp = require("../utils/generate_otp");
const sendOtp = require("../utils/send_otp");
const adminModel = require("../models/admin.model");
const Institute = require("../models/institute.model");
const Student = require("../models/student.model");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 🔐 Common JWT generator
const generateToken = (user, role) => {
  return jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: "1d" });
};

// ============================
// 🟩 Admin Login with OTP
// ============================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = password==admin.password
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const otp = generateOtp();
    await adminModel.findOneAndUpdate(
      { email },
      {
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000, // 10 mins validity
      }
    );

    await sendOtp(email, otp, "admin", "login");

    return res.status(200).json({
      message: "OTP sent to registered email. Please verify to complete login.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ============================
// 🟦 Institute Login with OTP
// ============================
const loginInstitute = async (req, res) => {
  try {
    const { email, password } = req.body;
    const institute = await Institute.findOne({ email });

    if (!institute) return res.status(404).json({ message: "Institute not found" });
    if (!institute.isApproved)
      return res.status(403).json({ message: "Institute not approved yet" });

    const isMatch = await bcrypt.compare(password, institute.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const otp = generateOtp();
    await Institute.findOneAndUpdate(
      { email },
      {
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000,
      }
    );

    await sendOtp( email, otp, "institute", "login");

    return res.status(200).json({
      message: "OTP sent to registered email. Please verify to complete login.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ============================
// 🟪 Student Login with OTP
// ============================
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });

    if (!student) return res.status(404).json({ message: "Student not found" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const otp = generateOtp();
    await Student.findOneAndUpdate(
      { email },
      {
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000,
      }
    );

    await sendOtp( email, otp, "student", "login");

    return res.status(200).json({
      message: "OTP sent to registered email. Please verify to complete login.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ============================
// 🔍 Verify OTP (Common for all roles)
// ============================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    let Model;
    if (role === "admin") Model = adminModel;
    else if (role === "institute") Model = Institute;
    else if (role === "student") Model = Student;
    else return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > user.otpExpires)
      return res.status(400).json({ message: "OTP expired" });

    // OTP valid → clear it and issue token
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user, role);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  loginAdmin,
  loginInstitute,
  loginStudent,
  verifyOtp,
};
