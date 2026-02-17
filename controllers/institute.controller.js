const Student = require("../models/student.model");
const Certificate = require("../models/certificate.model");
const Institute = require("../models/institute.model");
const {sendCertificateIssuedEmail,sendStudentVerificationEmail,sendInstituteVerificationEmail} = require("../utils/emails"); // assume nodemailer helper
const fs = require("fs");
const ipfs = require("../utils/ipfsClient");
const { uploadToPinata } = require("../utils/pinata");

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
      } = req.body;
      console.log(studentId)
      const student = await Student.findOne({
        reg_no: studentId,
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
    const ipfsHash = await uploadToPinata(req.file.path);

      // Remove local file
      // console.log(ipfsHash.cid)
      fs.unlinkSync(req.file.path);
      const certificate = await Certificate.create({
      studentId: student._id,
      instituteId,
      courseName,
      ipfsHash: ipfsHash.cid
    });
    await Institute.findByIdAndUpdate(instituteId,{
     $inc: { certificate_issue_count: 1 }
    })
    // console.log(certificate)
      res.status(201).json({
        message: "File uploaded to IPFS successfully",
        data:{
          id:certificate._id,
          ipfsHash:ipfsHash.cid,
          studentId:student._id,
          instituteId
        }
      });

      // 📧 Send email
      // await sendCertificateIssuedEmail({
      //     studentEmail:student.email,
      //     studentName:student.name,
      //     courseName
      // });
    } catch (error) {
      res.status(500).json({
        message: "Failed to issue certificate",
        error: error.message,
      });
    }
  };
  

  exports.putTransId=async(req,res)=>{
    try {
      const { id,tranxId}=req.body
      await Certificate.findByIdAndUpdate(id,{
        transactionHash:tranxId,
        valid:true
      })
      return res.status(200).send(
        {
          "message":"certificate updated ",
          "success":true,
          "error":false
        }
      )
    } catch (error) {
      res.status(500).json({
        message: "Failed to issue certificate",
        error: error.message,
      });
    }
  }

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
    const {isVerified}=req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find({ instituteId,verificationStatus:isVerified })
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



