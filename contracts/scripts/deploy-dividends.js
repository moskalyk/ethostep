const hre = require("hardhat");

// async function main() {
//   const NFT = await hre.ethers.getContractFactory("DividendRightsToken");
//   const nft = await NFT.deploy();
//   await nft.deployed();
//   console.log("DividendRightsToken deployed to:", nft.address);
// }

// main().then(() => process.exit(0)).catch(error => {
//   console.error(error);
//   process.exit(1);
// });


const { web3tx } = require("@decentral.ee/web3-helpers");
const { setWeb3Provider } = require("@decentral.ee/web3-helpers/src/config");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
require('hardhat-deploy');

async function main() {
    try {
        const version = process.env.RELEASE_VERSION || "test";
        console.log("release version:", version);

        // make sure that we are using the same web3 provider in the helpers
        setWeb3Provider(hre.ethers.provider);

        const sf = new SuperfluidSDK.Framework({
            ethers: hre.ethers.provider,
            version: version,
            tokens: ["fDAI"]
        });
        await sf.initialize();

        const DividendRightsToken = await hre.ethers.getContractFactory("DividendRightsToken");

        // console.log(DividendRightsToken)
        const app = await DividendRightsToken.deploy(
              "Dividend Rights Token",
              "DRT",
              sf.tokens.fDAIx.address,
              sf.host.address,
              sf.agreements.ida.address
        )

        // const app = await web3tx(
        //     DividendRightsToken.new,
        //     "Deploy DividendRightsToken"
        // )(
        //     "Dividend Rights Token",
        //     "DRT",
        //     sf.tokens.fDAIx.address,
        //     sf.host.address,
        //     sf.agreements.ida.address
        // );
        console.log("App deployed at", app.address);
    } catch (err) {
        console.log(err);
    }

}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
