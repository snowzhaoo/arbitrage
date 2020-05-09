'use strict';
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const MockKyber = artifacts.require("MockKyber");
const MockToken = artifacts.require('MockToken');

const { expect } = require('chai');
const expectedRate = '581750834000000000000';
const slippageRate = '578842079830000000000'; 

let ethAddr = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
contract('MockKyber', (accounts) => {
    const [ owner, other ] = accounts;
    let kyberProvide;
    let DAIProvide;
    let WETHProvide;
    let tokens;
    beforeEach(async () => {
         kyberProvide = await MockKyber.new(expectedRate,slippageRate,{from:owner});
         DAIProvide = await MockToken.new("DAI Token","DAI",18,{ from: owner });
         WETHProvide = await MockToken.new("weth Token","WETH",18,{ from: owner });

         tokens = [ethAddr, DAIProvide.address];

         DAIProvide.transfer(kyberProvide.address, web3.utils.toWei('100','ether'), {from:owner})
         expect(await DAIProvide.balanceOf(kyberProvide.address)).to.be.bignumber.equal(web3.utils.toWei("100","ether"))

         WETHProvide.transfer(other, web3.utils.toWei('0.1','ether'), {from:owner})
         expect(await WETHProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei("0.1","ether"))
    })

    it('test get gxpected rate', async () => {
        const receipt = await kyberProvide.getExpectedRate(tokens[0],tokens[1], web3.utils.toWei('1', 'ether'));

        expect(receipt.expectedRate).to.be.bignumber.equal(expectedRate);
        expect(receipt.slippageRate).to.be.bignumber.equal(slippageRate);

    })

    it('test eth to tokne trade', async () => {
        await kyberProvide.trade(tokens[0], web3.utils.toWei('0.1','ether'), tokens[1], other, web3.utils.toWei('100', 'ether'), 1, '0x0000000000000000000000000000000000000000', {value: web3.utils.toWei('0.1','ether'),from:other});

        expect(await DAIProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei('58.1750834','ether'))
        expect(await web3.eth.getBalance(kyberProvide.address)).to.be.bignumber.equal(web3.utils.toWei("0.1","ether"))
    })

    it('test token to token trade', async () => {

        await WETHProvide.approve(kyberProvide.address, web3.utils.toWei('0.1', 'ether'),{from: other});
        await kyberProvide.trade(WETHProvide.address, web3.utils.toWei('0.1','ether'), tokens[1], other, web3.utils.toWei('100', 'ether'), 1, '0x0000000000000000000000000000000000000000', {from:other});

        expect(await DAIProvide.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei('58.1750834','ether'))
        expect(await WETHProvide.balanceOf(kyberProvide.address)).to.be.bignumber.equal(web3.utils.toWei('0.1','ether'))

    })
})