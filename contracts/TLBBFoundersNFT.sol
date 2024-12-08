// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract TLBBFoundersNFT is ERC721URIStorage, Ownable, IERC2981 {
    uint256 public maxSupply; // Maximum number of NFTs
    uint256 public mintPrice; // Price for minting an NFT
    uint256 public currentTokenId; // Tracks the next token ID to mint

    address public charityWallet; // Address to receive charity funds
    address public operationsWallet; // Address to receive royalty funds

    uint96 public constant ROYALTY_PERCENTAGE = 200; // 2% royalties (200 basis points)

    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor(
        address _charityWallet,
        address _operationsWallet,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) ERC721("TLBB Founders NFT", "TLBB") {
        require(_charityWallet != address(0), "Invalid charity wallet");
        require(_operationsWallet != address(0), "Invalid operations wallet");
        require(_maxSupply > 0, "Max supply must be greater than 0");

        charityWallet = _charityWallet;
        operationsWallet = _operationsWallet;
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
    }

    // Mint function
    function mint(address to, string memory tokenURI) external payable {
        require(currentTokenId < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");

        uint256 tokenId = currentTokenId;
        currentTokenId++;

        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        _distributeFunds();
        emit NFTMinted(to, tokenId, tokenURI);
    }

    // Distribute minting proceeds
    function _distributeFunds() internal {
        uint256 charityShare = (msg.value * 50) / 100;
        uint256 ownerShare = msg.value - charityShare;

        payable(charityWallet).transfer(charityShare);
        payable(owner()).transfer(ownerShare);
    }

    // Set new mint price
    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
    }

    // Update charity wallet
    function setCharityWallet(address _charityWallet) external onlyOwner {
        require(_charityWallet != address(0), "Invalid charity wallet");
        charityWallet = _charityWallet;
    }

    // Update operations wallet
    function setOperationsWallet(address _operationsWallet) external onlyOwner {
        require(_operationsWallet != address(0), "Invalid operations wallet");
        operationsWallet = _operationsWallet;
    }

    // ERC-2981 royalty implementation
    function royaltyInfo(uint256, uint256 salePrice)
        external
        view
        override
        returns (address, uint256)
    {
        uint256 royaltyAmount = (salePrice * ROYALTY_PERCENTAGE) / 10000;
        return (address(this), royaltyAmount); // Contract receives royalties
    }

    // Distribute royalties from contract balance
    function distributeRoyalties() external {
        uint256 balance = address(this).balance;
        uint256 charityShare = (balance * 50) / 100;
        uint256 operationsShare = balance - charityShare;

        payable(charityWallet).transfer(charityShare);
        payable(operationsWallet).transfer(operationsShare);
    }

    // Fallback to accept royalties
    receive() external payable {}
}