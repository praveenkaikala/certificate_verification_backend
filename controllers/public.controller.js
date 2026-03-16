const connectFabric = require("../fabric/connection");
const Certificate = require("../models/certificate.model");
exports.getCertificateDetails = async (req, res) => {
  try {
    const { id } = req.params;

      const { contract, gateway } = await connectFabric();

    const result = await contract.evaluateTransaction(
      "VerifyCertificate",
     id 
    );

    await gateway.disconnect();
    const fabric= JSON.parse( result.toString())
    if( fabric.status != "VALID")
    {
      return res.status(404).send({
        message:"certificate not found in fabric"
      })
    }
      const details = await Certificate.findOne({ _id: id ,valid:true})
      .populate({
        path: "studentId",
        select: "name email reg_no walletAddress", // only these fields
      })
      .populate({
        path: "instituteId",
        select: "name walletAddress",
      })
      .select("courseName ipfsHash valid transactionHash issueDate");
      if(!details)
      {
        return res.status(404).send({
          message:"certificate not valid from database"
        })
      }
    res.status(200).send({
      message: "datails",
      data: details,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch certificate",
      error: error.message,
    });
  }
};
