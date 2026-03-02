const Institute = require("../models/institute.model");
const Student = require("../models/student.model");
const Certificate = require("../models/certificate.model");


/**
 * 📊 Get student dashboard stats
 */
exports.getStats = async (req, res) => {
  try {
    const studentId = req.student._id;

    const student = await Student.findById(studentId)
      .select("name email valid createdAt")
      .populate("instituteId", "name");

    const certificates = await Certificate.find({ studentId,valid:true }).select("_id courseName ipfsHash issueDate transactionHash valid");
    const totalCertificates=certificates.length;

    res.status(200).json({
      student: {
        name: student.name,
        email: student.email,
        institute: student.instituteId?.name,
        verified: student.valid,
        enrolled:student.createdAt
      },
        totalCertificates,
      data:certificates
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student stats",
      error: error.message,
    });
  }
};


/**
 * 📜 Get all certificates of a student
 */
exports.getCertificates = async (req, res) => {
  try {
    const studentId = req.student._id;

    const certificates = await Certificate.find({ studentId })
      .select("-__v")
      .populate("instituteId", "name")
      .sort({ issueDate: -1 });

    res.status(200).json({
      total: certificates.length,
      certificates,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch certificates",
      error: error.message,
    });
  }
};


/**
 * 🔍 Get single certificate by ID
 */
exports.getCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const studentId = req.student._id;

    const certificate = await Certificate.findOne({
      _id: certificateId,
      studentId,
    })
      .populate("instituteId", "name email")
      .populate("studentId", "name email");

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }

    res.status(200).json(certificate);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch certificate",
      error: error.message,
    });
  }
};
