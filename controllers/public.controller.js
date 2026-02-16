const Certificate = require("../models/certificate.model");
exports.getCertificateDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const details = await Certificate.findOne({ _id: id })
      .populate({
        path: "studentId",
        select: "name email reg_no walletAddress", // only these fields
      })
      .populate({
        path: "instituteId",
        select: "name walletAddress",
      })
      .select("courseName ipfsHash valid transactionHash issueDate");
    res.status(200).send({
      message: "datails",
      data: details,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to issue certificate",
      error: error.message,
    });
  }
};
