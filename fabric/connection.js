const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

async function connectFabric() {
  try {
    
const ccpPath = path.resolve(
  "/home/praveen/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json"
);

    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    const walletPath = path.join(__dirname, "../wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
      wallet,
      identity: "admin",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = network.getContract("certificate");

    return { gateway, contract };
  } catch (error) {
    console.error("Fabric connection failed:", error);
  }
}

module.exports = connectFabric;