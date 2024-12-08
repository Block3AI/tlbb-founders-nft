const hre = require("hardhat");

async function main() {
  const contractAddress = "<DEPLOYED_CONTRACT_ADDRESS>"; // Replace with your deployed contract address
  const nftContract = await hre.ethers.getContractAt("TLBBFoundersNFT", contractAddress);

  const metadataURIs = [
    "ipfs://<METADATA_CID_1>",
    "ipfs://<METADATA_CID_2>",
    "ipfs://<METADATA_CID_3>",
    "ipfs://<METADATA_CID_4>"
  ];

  for (let i = 0; i < metadataURIs.length; i++) {
    console.log(`Minting NFT #${i + 1}...`);
    const tx = await nftContract.mint("0x2Fe3CDACEea26B76AEc5Ffa32AC2822F1B72370B", metadataURIs[i], {
      value: hre.ethers.utils.parseEther("0.05"),
    });
    await tx.wait();
    console.log(`NFT #${i + 1} minted.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});