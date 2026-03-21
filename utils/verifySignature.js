const crypto = require("crypto");

function verifySignature(data, signature, publicKey) {
  const verify = crypto.createVerify("SHA256");
  verify.update(JSON.stringify(data));
  verify.end();

  return verify.verify(publicKey, signature, "base64");
}

module.exports=verifySignature