const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("TLBBFoundersNFT", function () {
  let NFTContract, nft, owner, charityWallet, operationsWallet, user;

  const maxSupply = 4;
  const mintPrice = ethers.utils.parseEther("0.05"); // 0.05 ETH
  const royaltyPercentage = 200; // 2%

  beforeEach(async function () {
    // Get test accounts
    [owner, charityWallet, operationsWallet, user] = await ethers.getSigners();

    // Deploy the contract
    NFTContract = await ethers.getContractFactory("TLBBFoundersNFT");
    nft = await NFTContract.deploy(
      charityWallet.address,
      operationsWallet.address,
      maxSupply,
      mintPrice
    );
    await nft.deployed();
  });

  it("should deploy with correct parameters", async function () {
    expect(await nft.charityWallet()).to.equal(charityWallet.address);
    expect(await nft.operationsWallet()).to.equal(operationsWallet.address);
    expect(await nft.maxSupply()).to.equal(maxSupply);
    expect(await nft.mintPrice()).to.equal(mintPrice);
  });

  it("should mint an NFT and distribute proceeds", async function () {
    const tokenURI = "ipfs://example-metadata-uri";

    // Capture initial balances
    const charityBalanceBefore = await ethers.provider.getBalance(charityWallet.address);
    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

    // Mint an NFT
    const tx = await nft.connect(user).mint(user.address, tokenURI, { value: mintPrice });
    await tx.wait();

    // Verify NFT was minted
    expect(await nft.ownerOf(0)).to.equal(user.address);

    // Check payment distribution
    const charityBalanceAfter = await ethers.provider.getBalance(charityWallet.address);
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

    expect(charityBalanceAfter.sub(charityBalanceBefore)).to.equal(mintPrice.div(2));
    expect(ownerBalanceAfter.sub(ownerBalanceBefore)).to.equal(mintPrice.div(2));
  });

  it("should fail minting when insufficient payment is sent", async function () {
    const tokenURI = "ipfs://example-metadata-uri";
    await expect(
      nft.connect(user).mint(user.address, tokenURI, { value: mintPrice.sub(1) })
    ).to.be.revertedWith("Insufficient payment");
  });

  it("should fail minting when max supply is reached", async function () {
    const tokenURI = "ipfs://example-metadata-uri";

    // Mint all tokens
    for (let i = 0; i < maxSupply; i++) {
      await nft.connect(user).mint(user.address, tokenURI, { value: mintPrice });
    }

    // Try to mint beyond max supply
    await expect(
      nft.connect(user).mint(user.address, tokenURI, { value: mintPrice })
    ).to.be.revertedWith("Max supply reached");
  });

  it("should calculate royalties correctly", async function () {
    const salePrice = ethers.utils.parseEther("1.0"); // 1 ETH sale price
    const [receiver, royaltyAmount] = await nft.royaltyInfo(0, salePrice);

    // Check royalty receiver and amount
    expect(receiver).to.equal(nft.address);
    expect(royaltyAmount).to.equal(salePrice.mul(royaltyPercentage).div(10000));
  });

  it("should allow only the owner to update charity wallet", async function () {
    const newCharityWallet = ethers.Wallet.createRandom().address;

    // Update charity wallet as owner
    await nft.connect(owner).setCharityWallet(newCharityWallet);
    expect(await nft.charityWallet()).to.equal(newCharityWallet);

    // Fail to update charity wallet as non-owner
    await expect(
      nft.connect(user).setCharityWallet(user.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should allow only the owner to update mint price", async function () {
    const newMintPrice = ethers.utils.parseEther("0.1"); // 0.1 ETH

    // Update mint price as owner
    await nft.connect(owner).setMintPrice(newMintPrice);
    expect(await nft.mintPrice()).to.equal(newMintPrice);

    // Fail to update mint price as non-owner
    await expect(
      nft.connect(user).setMintPrice(newMintPrice)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});