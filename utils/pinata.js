const { PinataSDK } = require("pinata")
const fs = require("fs")
const { Blob } = require("buffer")
require("dotenv").config()

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY
})
const uploadToPinata = async (filePath) => {
    try {
    const blob = new Blob([fs.readFileSync(filePath)]);
    const upload = await pinata.upload.public.file(blob);
    return upload
  } catch (error) {
    console.log(error)
  } 
};



module.exports = { uploadToPinata };