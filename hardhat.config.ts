import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

import "hardhat-deploy";

import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const chainIds = {
  hardhat: 1337,
  mainnet: 1,
  binance: 56,
  polygon: 137,
  avalanche: 43114,
  fantom: 250,
  goerli: 5,
  kovan: 42,
  rinkeby: 4,
  ropsten: 3,
  bscTestnet: 97,
  mumbai: 80001,
  fuji: 43113
};

// Ensure that we have all the environment variables we need.
const privateKey = process.env.PRIVATE_KEY ?? "NO_PRIVATE_KEY";
const reportGas = process.env.REPORT_GAS ? true : false;
const infuraKey = process.env.INFURA_KEY;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY ?? "NO_API_KEY";
const bscscanApiKey= process.env.BSCSCAN_API_KEY ?? "NO_API_KEY";
const polygonscanApiKey= process.env.POLYGONSCAN_API_KEY ?? "NO_API_KEY"; 
const snowscanApiKey= process.env.SNOWSCAN_API_KEY ?? "NO_API_KEY";
const ftmscanApiKey= process.env.FTMSCAN_API_KEY ?? "NO_API_KEY";
const coinmarketcapApiKey = process.env.COINMARKETCAP_API_KEY;
const gasPricePublicApi =
  "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: reportGas,
    excludeContracts: [],
    src: "./contracts",
    token: "ETH",
    showTimeSpent: true,
    gasPriceApi: gasPricePublicApi,
    coinmarketcap: coinmarketcapApiKey,
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://rpc.ankr.com/eth`,
      },
      chainId: chainIds.hardhat,
    },
    mainnet: {
      accounts: [`${privateKey}`],
      chainId: chainIds.mainnet,
      url: "https://rpc.ankr.com/eth",
      gasPrice: "auto",
    },
    goerli: {
      accounts: [`${privateKey}`],
      chainId: chainIds.goerli,
      url: `https://goerli.infura.io/v3/${infuraKey}`,
      gasPrice: "auto",
    },
    kovan: {
      accounts: [`${privateKey}`],
      chainId: chainIds.kovan,
      url: `https://kovan.infura.io/v3/${infuraKey}`,
      gasPrice: "auto",
    },
    rinkeby: {
      accounts: [`${privateKey}`],
      chainId: chainIds.rinkeby,
      url: `https://rinkeby.infura.io/v3/${infuraKey}`,
      gasPrice: "auto",
    },
    ropsten: {
      accounts: [`${privateKey}`],
      chainId: chainIds.ropsten,
      url: `https://ropsten.infura.io/v3/${infuraKey}`,
      gasPrice: "auto",
    },
    binance: {
      accounts: [`${privateKey}`],
      chainId: chainIds.binance,
      url: "https://rpc.ankr.com/bsc",
      gasPrice: "auto",
    },
    polygon: {
      accounts: [`${privateKey}`],
      chainId: chainIds.polygon,
      url: "https://rpc.ankr.com/polygon",
      gasPrice: "auto",
    },
    avalanche: {
      accounts: [`${privateKey}`],
      chainId: chainIds.avalanche,
      url: "https://rpc.ankr.com/avalanche",
      gasPrice: "auto",
    },
    fantom: {
      accounts: [`${privateKey}`],
      chainId: chainIds.fantom,
      url: "https://rpc.ankr.com/fantom",
      gasPrice: "auto",
    },
    bscTestnet: {
      accounts: [`${privateKey}`],
      chainId: chainIds.bscTestnet,
      url: "https://data-seed-prebsc-2-s2.binance.org:8545",
      gasPrice: "auto",
    },
    mumbai: {
      accounts: [`${privateKey}`],
      chainId: chainIds.mumbai,
      url: "https://rpc.ankr.com/polygon_mumbai",
      gasPrice: "auto",
    },
    fuji: {
      accounts: [`${privateKey}`],
      chainId: chainIds.fuji,
      url: "https://rpc.ankr.com/avalanche_fuji",
      gasPrice: "auto",
    },

  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
    deploy: "./scripts/deploy",
    deployments: "./deployments",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          metadata: {
            bytecodeHash: "none",
          },
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
      },
    ],
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
  etherscan: {
    apiKey: {
      mainnet: etherscanApiKey,
      goerli: etherscanApiKey,
      kovan: etherscanApiKey,
      rinkeby: etherscanApiKey,
      ropsten: etherscanApiKey,
      bsc: bscscanApiKey, 
      bscTestnet: bscscanApiKey,
      polygon: polygonscanApiKey,
      polygonMumbai: polygonscanApiKey, 
      avalanche: snowscanApiKey,
      avalancheFujiTestnet: snowscanApiKey,
      opera: ftmscanApiKey, 
    }
  },
  mocha: {
    timeout: 1000000,
  },
};

export default config;
