'use strict';
const MockToken = artifacts.require("MockToken");
const Arbitrage = artifacts.require("Arbitrage");
const MockKyber = artifacts.require("MockKyber");
const MockUniswap = artifacts.require("MockUniswap");

module.exports = async function(deployer) {
  await deployer.deploy(MockToken, "simpleToken","DAI", 18)
  await deployer.deploy(MockUniswap, MockToken.address, web3.utils.toWei("153","ether"))
  // deployer.deploy(Arbitrage, ['0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95','0x818E6FECD516Ecc3849DAf6845e3EC868087B755']);    //[uniswap,kyber]
  // deployer.deploy(Arbitrage, [0x01,0x002],[['0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'],['0x818E6FECD516Ecc3849DAf6845e3EC868087B755']]);    //[uniswap,kyber]
  await deployer.deploy(MockKyber,'581750834000000000000','578842079830000000000');
  await deployer.deploy(Arbitrage, [web3.utils.toHex('uniswap'),web3.utils.toHex('kyber')],[['0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95','0x818E6FECD516Ecc3849DAf6845e3EC868087B755'],['0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95','0x818E6FECD516Ecc3849DAf6845e3EC868087B755']]);    //[uniswap,kyber]
};
