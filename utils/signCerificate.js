const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function signCertificate(data, instituteId) {
  const keyPath = path.join(__dirname, `../keys/${instituteId}.pem`);
  const privateKey = fs.readFileSync(keyPath, "utf8");
  console.log("privatekry")
  const sign = crypto.createSign("SHA256");
  sign.update(JSON.stringify(data));
  sign.end();

  const signature = sign.sign(privateKey, "base64");
  return signature;
}


module.exports=signCertificate