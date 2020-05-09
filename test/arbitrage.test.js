'use strict';
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const MockToken = artifacts.require('MockToken');
const Arbitrage = artifacts.require("Arbitrage");
const MockKyber = artifacts.require("MockKyber");
const MockUniswap = artifacts.require("MockUniswap");

const expectedRate = '581750834000000000000';
const slippageRate = '578842079830000000000'; 
let ethAddr = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

contract('Arbitrage', (accounts) => {
    const [ owner, other ] = accounts;
    let arbitrageProvide;
    let DAIProvide;
    let WETHProvide;
    let kyberProvide;
    let uniswapProvide;

    let tokens;
    let eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    beforeEach(async () => {
        WETHProvide = await MockToken.new("WETH Token","WETH",18,{ from: owner });

        DAIProvide = await MockToken.new("DAI Token","DAI",18,{ from: owner });
        tokens = [eth, DAIProvide.address];
        arbitrageProvide = await Arbitrage.new([web3.utils.toHex('uniswap'),web3.utils.toHex('kyber')],[tokens,tokens],{from:owner});
        kyberProvide = await MockKyber.new(expectedRate,slippageRate,{from:owner});
        uniswapProvide = await MockUniswap.new(DAIProvide.address, expectedRate, { from: owner });
    })

    it('test get support dex token by Dex name in Hex', async () => {

        const receipt = await arbitrageProvide.getDexTokenList(web3.utils.toHex('uniswap'));
        expect(receipt).to.deep.equal(tokens);

    })

    it('test add dex', async () => {
        await arbitrageProvide.addDex(web3.utils.toHex('bancor'),['0x0000000000000000000000000000000000000001','0x0000000000000000000000000000000000000002'])
        const receipt = await arbitrageProvide.getDexTokenList(web3.utils.toHex('bancor'));
        expect(receipt).to.deep.equal(['0x0000000000000000000000000000000000000001','0x0000000000000000000000000000000000000002']);
    })

    it('test update dex only owner', async () => {
        await expectRevert(arbitrageProvide.updateDex(web3.utils.toHex('uniswap'), tokens, {from: other}), 'Ownable: caller is not the owner')
    })

    it('test update dex list and get dex list', async () => {

        await arbitrageProvide.updateDex(web3.utils.toHex('uniswap'), ['0x0000000000000000000000000000000000000001','0x0000000000000000000000000000000000000002']);
        const receipt = await arbitrageProvide.getDexTokenList(web3.utils.toHex('uniswap'));

        expect(receipt).to.deep.equal(['0x0000000000000000000000000000000000000001','0x0000000000000000000000000000000000000002']);
    })

    it('test get support dex', async () => {

        let receipt = (await arbitrageProvide.getDexList()).map((n) => web3.utils.numberToHex(n.toString()))
        expect(receipt).to.deep.equal([web3.utils.toHex('uniswap'), web3.utils.toHex('kyber')]);
    })

    it('test withdraw eth', async function () {
        await arbitrageProvide.send(web3.utils.toWei("1","ether"), { from: owner })
        expect(await web3.eth.getBalance(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1","ether"))
  
        await arbitrageProvide.withdraw("0x0000000000000000000000000000000000000000", {from: owner})
        expect(await web3.eth.getBalance(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("0","ether"))

        expectRevert(arbitrageProvide.withdraw("0x0000000000000000000000000000000000000000", {from: other}), 'Ownable: caller is not the owner')
    })
  
    it('test withdraw erc20', async function () {
  
      await DAIProvide.transfer(arbitrageProvide.address, web3.utils.toWei("10","ether"),{from: owner})
      expect(await DAIProvide.balanceOf(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("10","ether"))
  
      let DAIBlance = await DAIProvide.balanceOf(owner)
  
      await arbitrageProvide.withdraw(DAIProvide.address, { from: owner })
  
      expect(await DAIProvide.balanceOf(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("0","ether"))
      expect(await DAIProvide.balanceOf(owner)).to.be.bignumber.equal(DAIBlance.add(new BN(web3.utils.toWei("10","ether"))))
  
      expectRevert(arbitrageProvide.withdraw(DAIProvide.address, {from: other}), 'Ownable: caller is not the owner')
    });
async function mockKyber() {
    DAIProvide.transfer(kyberProvide.address, web3.utils.toWei('581.750834','ether'), {from:owner})
    expect(await DAIProvide.balanceOf(kyberProvide.address)).to.be.bignumber.equal(web3.utils.toWei("581.750834","ether"))

    await kyberProvide.send(web3.utils.toWei("1","ether"), { from: owner })
    expect(await web3.eth.getBalance(kyberProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1","ether"));
}
async function mockUniswap() {
    WETHProvide.transfer(uniswapProvide.address, web3.utils.toWei('1','ether'), {from:owner})
    expect(await WETHProvide.balanceOf(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1","ether"))

    await uniswapProvide.send(web3.utils.toWei("1","ether"), { from: owner })
    expect(await web3.eth.getBalance(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1","ether"));
}
    it('test arbitrage eth => DAI => eth from uniswap to kyber', async () => {
        // await mockKyber();
        // await mockUniswap();

        // let dexAddr = kyberProvide.address;
        // let dexIndex = web3.utils.toHex('kyber');
        // let srcAddr = tokens[0];
        // let srcAmount = web3.utils.toWei('1','ether');
        // let destAddr = tokens[1];
    })
    it('test arbitrage eth => DAI => eth from kyber to uniswap', async () => {
        await mockKyber();
        await mockUniswap();

        let dexAddr = kyberProvide.address;
        let dexIndex = web3.utils.toHex('kyber');
        let srcAddr = tokens[0];
        let srcAmount = web3.utils.toWei('1','ether');
        let destAddr = tokens[1];

        //   dexAddr/dexIndex/srcAddr/srcAmount/desAddr
        let params = `${web3.utils.padLeft(dexAddr,64)}${web3.utils.padLeft(dexIndex,64).slice(2)}${web3.utils.padLeft(srcAddr,64).slice(2)}${web3.utils.padLeft(web3.utils.toHex(srcAmount),64).slice(2)}${web3.utils.padLeft(destAddr,64).slice(2)}`;
        
        dexAddr = uniswapProvide.address;
        dexIndex = web3.utils.toHex('uniswap');
        srcAddr = DAIProvide.address;
        srcAmount = web3.utils.toWei('581.750834','ether');
        destAddr = eth;

        let params2 = `${web3.utils.padLeft(dexAddr,64)}${web3.utils.padLeft(dexIndex,64).slice(2)}${web3.utils.padLeft(srcAddr,64).slice(2)}${web3.utils.padLeft(web3.utils.toHex(srcAmount),64).slice(2)}${web3.utils.padLeft(destAddr,64).slice(2)}`;
        params = `${params}${params2.slice(2)}`;

        await arbitrageProvide.send(web3.utils.toWei("1","ether"), { from: owner })
        expect(await web3.eth.getBalance(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1","ether"));

        const receipt = await arbitrageProvide.getParams(params);

        // console.log(web3.utils.toHex('uniswap'));
        expectEvent(receipt, 'BidDex', { dex: web3.utils.hexToNumberString(dexIndex), dexAddr: dexAddr});
        expectEvent(receipt, 'TokenAddr', {src: srcAddr, dest: destAddr});
        expectEvent(receipt, 'Amount', {amount: srcAmount});

        expect(await DAIProvide.balanceOf(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("0","ether"))
        expect(await DAIProvide.balanceOf(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("581.750834","ether"))
        
    })

    it('test arbitrage DAI => eth => DAI from uniswap to kyber', async () => {

    })
    it('test arbitrage DAI => eth => DAI from kyber to uniswap', async () => {
    //     await mockKyber();
    //     await mockUniswap();

    // DAIProvide.transfer(arbitrageProvide.address, web3.utils.toWei('581.750834','ether'), {from:owner})
    // expect(await DAIProvide.balanceOf(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("581.750834","ether"))

    // // DAIProvide.transfer(uniswapProvide.address, web3.utils.toWei('581.750834','ether'), {from:owner})
    // // expect(await DAIProvide.balanceOf(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("581.750834","ether"))

    //     let dexAddr = kyberProvide.address;
    //     let dexIndex = web3.utils.toHex('kyber');
    //     let srcAddr = DAIProvide.address;
    //     let srcAmount = web3.utils.toWei('581.750834','ether');
    //     let destAddr = eth;

    //     //   dexAddr/dexIndex/srcAddr/srcAmount/desAddr
    //     let params = `${web3.utils.padLeft(dexAddr,64)}${web3.utils.padLeft(dexIndex,64).slice(2)}${web3.utils.padLeft(srcAddr,64).slice(2)}${web3.utils.padLeft(web3.utils.toHex(srcAmount),64).slice(2)}${web3.utils.padLeft(destAddr,64).slice(2)}`;
        
    //     // dexAddr = uniswapProvide.address;
    //     // dexIndex = web3.utils.toHex('uniswap');
    //     // srcAddr = eth;
    //     // srcAmount = web3.utils.toWei('1','ether');
    //     // destAddr = DAIProvide.address;

    //     // let params2 = `${web3.utils.padLeft(dexAddr,64)}${web3.utils.padLeft(dexIndex,64).slice(2)}${web3.utils.padLeft(srcAddr,64).slice(2)}${web3.utils.padLeft(web3.utils.toHex(srcAmount),64).slice(2)}${web3.utils.padLeft(destAddr,64).slice(2)}`;
    //     // params = `${params}${params2.slice(2)}`;
    //     // console.log(params);

    //     const receipt = await arbitrageProvide.getParams(params);

    //     // expectEvent(receipt, 'BidDex', { dex: web3.utils.hexToNumberString(dexIndex), dexAddr: dexAddr});
    //     // expectEvent(receipt, 'TokenAddr', {src: srcAddr, dest: destAddr});
    //     // expectEvent(receipt, 'Amount', {amount: srcAmount});
    //     expect(await DAIProvide.balanceOf(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("0","ether"))

    })


    it('test arbitrage wETH => DAI => wETH from kyber to uniswap', async () => {
        await mockKyber();
        await mockUniswap();

        WETHProvide.transfer(arbitrageProvide.address, web3.utils.toWei('1','ether'), {from:owner})
        expect(await WETHProvide.balanceOf(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1","ether"))


        let dexAddr = kyberProvide.address;
        let dexIndex = web3.utils.toHex('kyber');
        let srcAddr = WETHProvide.address;
        let srcAmount = web3.utils.toWei('1','ether');
        let destAddr = DAIProvide.address;

        //   dexAddr/dexIndex/srcAddr/srcAmount/desAddr
        let params = `${web3.utils.padLeft(dexAddr,64)}${web3.utils.padLeft(dexIndex,64).slice(2)}${web3.utils.padLeft(srcAddr,64).slice(2)}${web3.utils.padLeft(web3.utils.toHex(srcAmount),64).slice(2)}${web3.utils.padLeft(destAddr,64).slice(2)}`;

        dexAddr = uniswapProvide.address;
        dexIndex = web3.utils.toHex('uniswap');
        srcAddr = DAIProvide.address;
        srcAmount = web3.utils.toWei('581.750834','ether');
        destAddr = WETHProvide.address;

        let params2 = `${web3.utils.padLeft(dexAddr,64)}${web3.utils.padLeft(dexIndex,64).slice(2)}${web3.utils.padLeft(srcAddr,64).slice(2)}${web3.utils.padLeft(web3.utils.toHex(srcAmount),64).slice(2)}${web3.utils.padLeft(destAddr,64).slice(2)}`;
        params = `${params}${params2.slice(2)}`;

        const receipt = await arbitrageProvide.getParams(params);

        expectEvent(receipt, 'BidDex', { dex: web3.utils.hexToNumberString(dexIndex), dexAddr: dexAddr});
        expectEvent(receipt, 'TokenAddr', {src: srcAddr, dest: destAddr});
        expectEvent(receipt, 'Amount', {amount: srcAmount});

        expect(await DAIProvide.balanceOf(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("0","ether"))
        expect(await DAIProvide.balanceOf(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("581.750834","ether"))

        expect(await WETHProvide.balanceOf(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1","ether"))
        expect(await WETHProvide.balanceOf(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("0","ether"))
 
    })
    it('test arbitrage wETH => DAI => wETH from uniswap to kyber', async () => {
        // await mockUniswap();
        // await mockKyber();
    uniswapProvide = await MockUniswap.new(WETHProvide.address, web3.utils.toWei('0.01','ether'), { from: owner });
    kyberProvide = await MockKyber.new(web3.utils.toWei('0.01','ether'),slippageRate,{from:owner});

    DAIProvide.transfer(uniswapProvide.address, web3.utils.toWei('100','ether'), {from:owner})
    expect(await DAIProvide.balanceOf(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("100","ether"))

    WETHProvide.transfer(kyberProvide.address, web3.utils.toWei('1','ether'), {from:owner})
    expect(await WETHProvide.balanceOf(kyberProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1","ether"))

        WETHProvide.transfer(arbitrageProvide.address, web3.utils.toWei('1','ether'), {from:owner})
        expect(await WETHProvide.balanceOf(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1","ether"))

        let dexAddr = uniswapProvide.address;
        let dexIndex = web3.utils.toHex('uniswap');
        let srcAddr = WETHProvide.address;
        let srcAmount = web3.utils.toWei('1','ether');
        let destAddr = DAIProvide.address;

        //   dexAddr/dexIndex/srcAddr/srcAmount/desAddr
        let params = `${web3.utils.padLeft(dexAddr,64)}${web3.utils.padLeft(dexIndex,64).slice(2)}${web3.utils.padLeft(srcAddr,64).slice(2)}${web3.utils.padLeft(web3.utils.toHex(srcAmount),64).slice(2)}${web3.utils.padLeft(destAddr,64).slice(2)}`;

        dexAddr = kyberProvide.address;
        dexIndex = web3.utils.toHex('kyber');
        srcAddr = DAIProvide.address;
        srcAmount = web3.utils.toWei('100','ether');
        destAddr = WETHProvide.address;

        let params2 = `${web3.utils.padLeft(dexAddr,64)}${web3.utils.padLeft(dexIndex,64).slice(2)}${web3.utils.padLeft(srcAddr,64).slice(2)}${web3.utils.padLeft(web3.utils.toHex(srcAmount),64).slice(2)}${web3.utils.padLeft(destAddr,64).slice(2)}`;
        params = `${params}${params2.slice(2)}`;
        
        const receipt = await arbitrageProvide.getParams(params);

        expectEvent(receipt, 'BidDex', { dex: web3.utils.hexToNumberString(dexIndex), dexAddr: dexAddr});
        expectEvent(receipt, 'TokenAddr', {src: srcAddr, dest: destAddr});
        expectEvent(receipt, 'Amount', {amount: srcAmount});

        expect(await DAIProvide.balanceOf(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("0","ether"))
        expect(await DAIProvide.balanceOf(kyberProvide.address)).to.be.bignumber.equal(web3.utils.toWei("100","ether"))
        expect(await DAIProvide.balanceOf(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("0","ether"))
        
        expect(await WETHProvide.balanceOf(arbitrageProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1","ether"))
        expect(await WETHProvide.balanceOf(kyberProvide.address)).to.be.bignumber.equal(web3.utils.toWei("0","ether"))
        expect(await WETHProvide.balanceOf(uniswapProvide.address)).to.be.bignumber.equal(web3.utils.toWei("1","ether"))
    })
})