"use strict"
import "./utils/env"
// import { expect } from "chai";
const Web3 = require('web3');
const abi = require('./utils/abi/kyberAbi.json')
const web3 = new Web3(`${process.env.INFRUA_URL}${process.env.INFRUA_ID}`);
const KyberAbi = abi.kyberAbi;

const kyber = new web3.eth.Contract(KyberAbi, process.env.KYBER_ADDR);

export class Kyber {
    proxyAddr: string
    constructor(proxyAddr: string) {
        this.proxyAddr = proxyAddr
    }
    async getExpectedRate(src: string, dest: string, srcQty: number): Promise<{expectedRate: string, slippageRate: string}> {
        let result = await kyber.methods.getExpectedRate(src, dest, srcQty).call()  
        return result
    }
}