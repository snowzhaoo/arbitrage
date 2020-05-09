'use strict';

const MockUniswap = artifacts.require("MockUniswap");
const MockToken = artifacts.require('MockToken');

const { expect } = require('chai');

contract('MockUniswap', (accounts) => {
    const [ owner, other ] = accounts;
    let DAIProvide;
    let WETHProvide;
    let uniswapProvide;
    beforeEach(async () => {
        
        WETHProvide = await MockToken.new("weth Token","WETH",18,{ from: owner });
        DAIProvide = await MockToken.new("DAI Token","DAI",18,{ from: owner });
        uniswapProvide = await MockUniswap.new(DAIProvide.address, web3.utils.toWei("153","ether"), { from: owner });

         // deposit  10 eth to uniswap exchange
        await uniswapProvide.send(web3.utils.toWei("10","ether"), { from: owner })
        expect(await web3.eth.getBalance(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("10","ether"));

        await DAIProvide.transfer(uniswapProvide.address, web3.utils.toWei("1530","ether"),{from: owner})
        expect(await DAIProvide.balanceOf(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1530","ether"))
    })

    it('test uniswap eth to token', async () => {

        let exchangeAddress = await uniswapProvide.getExchange("0xCC4d8eCFa6a5c1a84853EC5c0c08Cc54Cb177a6A");
        expect(exchangeAddress).equal(uniswapProvide.address)
        //mock exchange
        let exchangeProvide = uniswapProvide;
  
        let ethBalance = await web3.eth.getBalance(uniswapProvide.address)
        await exchangeProvide.ethToTokenSwapOutput(web3.utils.toWei("153","ether"),1742680400,{"value": ethBalance, from:other});
  
        expect(await DAIProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei("153","ether"));
    })

    it('test uniswap token to eth', async () => {
        await DAIProvide.transfer(other, web3.utils.toWei("153","ether"),{from: owner})
        expect(await DAIProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei("153","ether"))

        let exchangeAddress = await uniswapProvide.getExchange("0xCC4d8eCFa6a5c1a84853EC5c0c08Cc54Cb177a6A");
        //mock exchange
        let exchangeProvide = uniswapProvide;
  
        let tokenBalance = await DAIProvide.balanceOf(other);
        await DAIProvide.approve(exchangeProvide.address, web3.utils.toWei("153","ether"), {from:other});
        await exchangeProvide.tokenToEthSwapOutput(web3.utils.toWei("1","ether"), 1742680400, tokenBalance, {from:other});
        expect(await DAIProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei("0","ether"));
    })

    it('test uniswap token to token by output', async () => {

        await WETHProvide.transfer(other, web3.utils.toWei("1","ether"),{from: owner})
        expect(await WETHProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei("1","ether"))
  
        uniswapProvide = await MockUniswap.new(WETHProvide.address, web3.utils.toWei("0.01","ether"), { from: owner });
  
        await DAIProvide.transfer(uniswapProvide.address, web3.utils.toWei("100","ether"),{from: owner})
        expect(await DAIProvide.balanceOf(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("100","ether"))
  
        let exchangeAddress = await uniswapProvide.getExchange("0xCC4d8eCFa6a5c1a84853EC5c0c08Cc54Cb177a6A");
        //mock exchange
        let exchangeProvide = uniswapProvide;
  
        let WETHBalance = await WETHProvide.balanceOf(other)
        await WETHProvide.approve(exchangeProvide.address, WETHBalance, {from:other});
  
        await exchangeProvide.tokenToTokenSwapOutput(web3.utils.toWei("100","ether"), WETHBalance, web3.utils.toWei("10","ether"), 1742680400, DAIProvide.address, {from:other});
        expect(await WETHProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei("0","ether"));
        expect(await DAIProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei("100","ether"));
    })
    it('test uniswap token to token by input', async () => {

        await WETHProvide.transfer(other, web3.utils.toWei("1","ether"),{from: owner})
        expect(await WETHProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei("1","ether"))
  
        uniswapProvide = await MockUniswap.new(WETHProvide.address, web3.utils.toWei("0.01","ether"), { from: owner });
  
        await DAIProvide.transfer(uniswapProvide.address, web3.utils.toWei("100","ether"),{from: owner})
        expect(await DAIProvide.balanceOf(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("100","ether"))
  
        let exchangeAddress = await uniswapProvide.getExchange("0xCC4d8eCFa6a5c1a84853EC5c0c08Cc54Cb177a6A");
        //mock exchange
        let exchangeProvide = uniswapProvide;
  
        let WETHBalance = await WETHProvide.balanceOf(other)
        await WETHProvide.approve(exchangeProvide.address, WETHBalance, {from:other});
  
        await exchangeProvide.tokenToTokenSwapInput(web3.utils.toWei("1","ether"), 1, web3.utils.toWei("10","ether"), 1742680400, DAIProvide.address, {from:other});
        expect(await WETHProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei("0","ether"));
        expect(await DAIProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei("100","ether"));
    })
})