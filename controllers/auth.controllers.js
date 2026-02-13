const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateOtp = require("../utils/generate_otp");
const sendOtp = require("../utils/send_otp");
const adminModel = require("../models/admin.model");
const Institute = require("../models/institute.model");
const Student = require("../models/student.model");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET

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

    // await sendOtp( email, otp, "institute", "login");

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

/**
 * 🏫 Institute Registration
 */
const registerInstitute = async (req, res) => {
  try {
    const {
      name,
      email,
      reg_no,
      phone,
      password,
      address,
      walletAddress,
    } = req.body;

    // 1️⃣ Validate input
    if (!name || !email || !reg_no || !password || !walletAddress) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // 2️⃣ Check existing institute
    const exists = await Institute.findOne({
      $or: [{ email }, { reg_no }, { walletAddress }],
    });

    if (exists) {
      return res.status(409).json({
        message: "Institute already registered",
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create institute
    const institute = await Institute.create({
      name,
      email,
      reg_no,
      phone,
      password: hashedPassword,
      address,
      walletAddress,
      isApproved: false,
    });

    res.status(201).json({
      message: "Institute registered successfully. Await admin approval.",
      instituteId: institute._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Institute registration failed",
      error: error.message,
    });
  }
};

/**
 * 🎓 Student Registration
 */
const registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      instituteId,
      walletAddress,
      reg_no
    } = req.body;

    // 1️⃣ Validate input
    if (!name || !email || !phone || !password || !instituteId || !reg_no) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // 2️⃣ Check institute exists & approved
    const institute = await Institute.findOne({
      reg_no: instituteId,
      isApproved: true,
    });

    if (!institute) {
      return res.status(400).json({
        message: "Invalid or unapproved institute",
      });
    }

    // 3️⃣ Check existing student
    const exists = await Student.findOne({
      $or: [{ email }, { phone },{reg_no}],
    });

    if (exists) {
      return res.status(409).json({
        message: "Student already registered",
      });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 5️⃣ Create student
    const student = await Student.create({
      name,
      email,
      phone,
      password: hashedPassword,
      instituteId:institute._id,
      walletAddress,
      verificationStatus: false,reg_no,
    });

    res.status(201).json({
      message: "Student registered successfully. Await institute verification.",
      studentId: student._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Student registration failed",
      error: error.message,
    });
  }
};

module.exports = {
  loginAdmin,
  loginInstitute,
  loginStudent,
  verifyOtp,
  registerInstitute,
  registerStudent
};
