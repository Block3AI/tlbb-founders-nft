const hre = require("hardhat");

async function main() {
  const contractAddress = "<DEPLOYED_CONTRACT_ADDRESS>"; // Replace with your deployed contract address
  const nftContract = await hre.ethers.getContractAt("TLBBFoundersNFT", contractAddress);

  console.log("Simulating secondary sale...");
  const salePrice = hre.ethers.utils.parseEther("1.0"); // Example sale price
  const tx = await nftContract["royaltyInfo"](1, salePrice); // Call royaltyInfo
  const [receiver, royaltyAmount] = tx;

  console.log(`Royalties Receiver: ${receiver}`);
  console.log(`Royalty Amount: ${hre.ethers.utils.formatEther(royaltyAmount)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});