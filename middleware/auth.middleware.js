const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

exports.adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin; // attach admin to request
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};


exports.instituteAuth = async (req, res, next) => {
  try {
    // 1️⃣ Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Role check
    if (decoded.role !== "institute") {
      return res.status(403).json({
        message: "Access denied. Institute only.",
      });
    }

    // 4️⃣ Fetch institute
    const institute = await Institute.findById(decoded.id).select("-password");

    if (!institute) {
      return res.status(401).json({
        message: "Institute not found",
      });
    }

    // 5️⃣ Approval check (IMPORTANT)
    if (!institute.isApproved) {
      return res.status(403).json({
        message: "Institute is not approved by admin yet",
      });
    }

    // 6️⃣ Attach institute to request
    req.institute = institute;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

exports.studentAuth = async (req, res, next) => {
  try {
    // 1️⃣ Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Role validation
    if (decoded.role !== "student") {
      return res.status(403).json({
        message: "Access denied. Student only.",
      });
    }

    // 5️⃣ Fetch student
    const student = await Student.findById(decoded.id).select("-password");

    if (!student) {
      return res.status(401).json({
        message: "Student not found",
      });
    }

    // 6️⃣ Verification check (IMPORTANT)
    if (!student.verificationStatus) {
      return res.status(403).json({
        message: "Student not verified by institute yet",
      });
    }

    // 7️⃣ Attach student to request
    req.student = student;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
