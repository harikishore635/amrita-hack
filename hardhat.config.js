require("dotenv").config({ path: ".env.local" });
require("@nomicfoundation/hardhat-toolbox");

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const POLYGON_AMOY_RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {},
        amoy: {
            url: POLYGON_AMOY_RPC,
            accounts: [DEPLOYER_PRIVATE_KEY],
            chainId: 80002,
            gasPrice: 30000000000,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};
