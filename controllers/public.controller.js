const connectFabric = require("../fabric/connection");
const Certificate = require("../models/certificate.model");
const verifySignature = require("../utils/verifySignature");
exports.getCertificateDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const { contract, gateway } = await connectFabric();

    const result = await contract.evaluateTransaction(
      "VerifyCertificate",
      id
    );

    await gateway.disconnect();

    const fabric = JSON.parse(result.toString());

    if (fabric.status !== "VALID") {
      return res.status(404).send({
        message: "certificate not found in fabric",
      });
    }
    console.log("block verified")
    const details = await Certificate.findOne({ _id: id, valid: true })
      .populate({
        path: "studentId",
        select: "name email reg_no walletAddress",
      })
      .populate({
        path: "instituteId",
        select: "name walletAddress publicKey", // 🔥 include publicKey
      })
      .select("courseName ipfsHash valid transactionHash issueDate signature");

    if (!details) {
      return res.status(404).send({
        message: "certificate not valid from database",
      });
    }

    // 🔐 Prepare same data used during signing
    const dataToVerify = {
      certId: details._id.toString(),
      studentId: details.studentId._id.toString(),
      instituteId: details.instituteId._id.toString(),
      ipfsHash: details.ipfsHash,
    };

    // 🔏 Verify signature
    const isSignatureValid = verifySignature(
      dataToVerify,
      details.signature,
      details.instituteId.publicKey
    );
    console.log("sign verified")
    if (!isSignatureValid) {
      return res.status(400).send({
        message: "Signature verification failed (tampered certificate)",
      });
    }

    res.status(200).send({
      message: "Certificate verified successfully",
      data: details,
      signatureStatus: "VALID ",
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch certificate",
      error: error.message,
    });
  }
};
