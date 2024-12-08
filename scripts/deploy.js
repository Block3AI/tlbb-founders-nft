const hre = require("hardhat");

async function main() {
  const charityWallet = "0x2Fe3CDACEea26B76AEc5Ffa32AC2822F1B72370B";
  const operationsWallet = "0x2Fe3CDACEea26B76AEc5Ffa32AC2822F1B72370B";
  const maxSupply = 4;
  const mintPrice = hre.ethers.utils.parseEther("0.05"); // Mint price in ETH

  const TLBBFoundersNFT = await hre.ethers.getContractFactory("TLBBFoundersNFT");
  const nftContract = await TLBBFoundersNFT.deploy(
    charityWallet,
    operationsWallet,
    maxSupply,
    mintPrice
  );

  await nftContract.deployed();
  console.log("TLBBFoundersNFT deployed to:", nftContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});