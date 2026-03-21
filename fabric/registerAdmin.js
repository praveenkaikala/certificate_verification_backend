const { Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    const walletPath = path.join(__dirname, "../wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const certPath = path.resolve(
"/home/praveen/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem");

const keyDir = path.resolve(
  "/home/praveen/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore"
);

    const keyFile = fs.readdirSync(keyDir)[0];

    const keyPath = path.join(keyDir, keyFile);

    const cert = fs.readFileSync(certPath).toString();
    const key = fs.readFileSync(keyPath).toString();

    const identity = {
      credentials: {
        certificate: cert,
        privateKey: key,
      },
      mspId: "Org1MSP",
      type: "X.509",
    };

    await wallet.put("admin", identity);

    console.log("Admin identity added to wallet");
  } catch (error) {
    console.error(error);
  }
}

main();