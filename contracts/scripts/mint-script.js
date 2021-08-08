const hre = require("hardhat");
async function main() {
  const NFT = await hre.ethers.getContractFactory("MyNFT");
  const URI = "ipfs://QmZie8iXw2pnTpjqoaMkaSFLYC6nz9L3VEUHDJcDVDji2T"
  const WALLET_ADDRESS = "0xE01A0ba2ca92AD5f63b989596d3f966b4a395448"
  const CONTRACT_ADDRESS = "0x498A6ee1A1f4Cac9AC1DBbC33123E971a1dF875f"
  const contract = NFT.attach(CONTRACT_ADDRESS);
  await contract.mint(WALLET_ADDRESS, URI);
  console.log("NFT minted:", contract);
}
main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});