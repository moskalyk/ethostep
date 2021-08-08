const { expect } = require("chai");

// describe("NFT", function() {
//   it("It should deploy the contract, mint a token, and resolve to the right URI", async function() {
//     const NFT = await ethers.getContractFactory("MyNFT");
//     const nft = await NFT.deploy();
//     const URI = "ipfs://QmZie8iXw2pnTpjqoaMkaSFLYC6nz9L3VEUHDJcDVDji2T";
//     await nft.deployed();
//     await nft.mint("0xE01A0ba2ca92AD5f63b989596d3f966b4a395448", URI)
//     expect(await nft.tokenURI(1)).to.equal(URI)
//   });
// });

const hre = require("hardhat");

async function main() {
  const NFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = await NFT.deploy();
  await nft.deployed();
  console.log("NFT deployed to:", nft.address);
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});