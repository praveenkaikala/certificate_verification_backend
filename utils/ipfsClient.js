let ipfsClient;

const getIPFSClient = async () => {
  if (!ipfsClient) {
    const ipfsHttpClient = await import("ipfs-http-client");

   ipfs = ipfsHttpClient.create({
      url: "http://127.0.0.1:5001",
    });
  }

  return ipfsClient;
};

module.exports = getIPFSClient;
