const Student = require("../models/student.model");
const Certificate = require("../models/certificate.model");
const Institute = require("../models/institute.model");
const {sendCertificateIssuedEmail,sendStudentVerificationEmail,sendInstituteVerificationEmail} = require("../utils/emails"); // assume nodemailer helper
const fs = require("fs");
const ipfs = require("../utils/ipfsClient");
const { uploadToPinata } = require("../utils/pinata");
/**
 * ✅ Verify / Approve Student
 */
exports.verifyStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const instituteId = req.institute._id;

    const student = await Student.findOne({
      _id: studentId,
      instituteId,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.verificationStatus) {
      return res.status(400).json({ message: "Student already verified" });
    }

    student.verificationStatus = true;
    await student.save();

    // 📧 Send email
    await sendStudentVerificationEmail({
   studentEmail:student.email,
   studentName:student.name,
   instituteName:req.institute.name
    });

    res.status(200).json({
      message: "Student verified successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to verify student",
      error: error.message,
    });
  }
};


/**
 * 🎓 Issue Certificate to Student
 */
exports.issueCertificate = async (req, res) => {
  try {
    // DEBUG
    
    const instituteId = req.institute._id;
   
    const {
      studentId,
      courseName,
      issuerAddress,
      transactionHash,
      ipfsHash
    } = req.body;
    console.log(studentId)
    const student = await Student.findOne({
      _id: studentId,
      instituteId,
      verificationStatus: true,
    });

    if (!student) {
      return res.status(404).json({
        message: "Verified student not found",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        message: "Certificate file is required",
      });
    }
    console.log("uploading")
//    const ipfsHash = await uploadToPinata(req.file.path);

//     // Remove local file
//     fs.unlinkSync(req.file.path);

//     res.status(200).json({
//       message: "File uploaded to IPFS successfully",
//       ipfsHash,
//       gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash.cid}`,
//     });
    const certificateCount = await Certificate.countDocuments();
    const certificate = await Certificate.create({
      studentId,
      instituteId,
      studentName: student.name,
      courseName,
      ipfsHash,
      issuerAddress,
      transactionHash
    });

    // 📧 Send email
    // await sendCertificateIssuedEmail({
    //     studentEmail:student.email,
    //     studentName:student.name,
    //     courseName
    // });

    res.status(201).json({
      message: "Certificate issued successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to issue certificate",
      error: error.message,
    });
  }
};


/**
 * ❌ Remove Student
 */
exports.removeStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const instituteId = req.institute._id;

    const student = await Student.findOneAndDelete({
      _id: studentId,
      instituteId,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Optional: also delete certificates
    await Certificate.deleteMany({ studentId });

    res.status(200).json({
      message: "Student removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove student",
      error: error.message,
    });
  }
};


/**
 * 📋 Get all students of an institute
 */
exports.getAllStudents = async (req, res) => {
  try {
    const instituteId = req.institute._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find({ instituteId })
        .select("-password -otp -otpExpires")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Student.countDocuments({ instituteId }),
    ]);

    res.status(200).json({
      data: students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};


/**
 * 🔍 Get student by ID
 */
exports.getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const instituteId = req.institute._id;

    const student = await Student.findOne({
      _id: studentId,
      instituteId,
    }).select("-password -otp -otpExpires");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};


/**
 * 📜 Get all issued certificates
 */
exports.getIssuedCertificates = async (req, res) => {
  try {
    const instituteId = req.institute._id;

    const certificates = await Certificate.find({ instituteId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch certificates",
      error: error.message,
    });
  }
};
