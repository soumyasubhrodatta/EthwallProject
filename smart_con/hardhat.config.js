//https://eth-ropsten.alchemyapi.io/v2/n6sT3Y9SZBnSWO7_RFvk_08O_MFXZRbo

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/n6sT3Y9SZBnSWO7_RFvk_08O_MFXZRbo',
      accounts: ['8fab99b960b2431d129f6f283900679122f5771ba6e4e333e73247a7fd6de2c8']
    }
  }
}