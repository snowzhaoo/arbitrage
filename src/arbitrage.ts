"use strict";
import { Uniswap } from './uniswap'
import { BigNumber } from '@uniswap/sdk';
import { Kyber } from './kyber'

const Web3 = require('web3');

// const web3 = new Web3(`${process.env.INFRUA_URL}${process.env.INFRUA_ID}`);
// // const web3 = new Web3(`https://kovan.infura.io/v3/${process.env.INFRUA_ID}`);
// const config = require('./utils/abi/arbitrageAbi.json');
// import "./utils/env"

// const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;
// web3.eth.accounts.wallet.add(walletPrivateKey);
// const myWalletAddress = web3.eth.accounts.wallet[0].address;

// const myArbitrageAbi = config.arbritrageAbi;
// const myArbitrage = new web3.eth.Contract(myArbitrageAbi, process.env.ARBITRAGE_ADDR);
export interface Rate {
    rate: BigNumber
    rateInverted: BigNumber
}
export class Arbitrage {
    dexName: string
    dexProvide: any
    constructor(dexName: string) {
        this.dexName = dexName
        switch (this.dexName) {
            case 'uniswap': {
                this.dexProvide = new Uniswap(Number(process.env.CHAIN_ID))
            };break;
            case 'kyber': {
                this.dexProvide = new Kyber(process.env.KYBER_ADDR)
            };break;
        }
    }
    async getRate(src: string, dest: string, srcQty: number = 0): Promise<Rate> {
        //TODO token to token
        let rate
        switch (this.dexName) {
            case 'uniswap': {
                rate = await this.dexProvide.getRate(src, dest)
            };break;
            case 'kyber': {
                const kyberRate = await this.dexProvide.getExpectedRate(src, dest, srcQty)
                let destAmount = (new BigNumber(srcQty)).multipliedBy(kyberRate.expectedRate).dividedToIntegerBy(1e18).toString()
                //get inverted rate
                const kyberInvertedRate = await this.dexProvide.getExpectedRate(dest, src, destAmount)
                rate = {
                    rate: new BigNumber(Web3.utils.fromWei(kyberRate.expectedRate)),
                    rateInverted: new BigNumber(Web3.utils.fromWei(kyberInvertedRate.expectedRate)) 
                }
            };break;
        }
        return rate
    }
    async getExchange(tokenAddr: string): Promise<string> {
        switch (this.dexName) {
            case 'uniswap': {
                return await this.dexProvide.getExchange(tokenAddr)
            };break;
        }
    }

}