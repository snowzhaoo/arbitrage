'use strict'
import "./utils/env"
const Web3 = require('web3');

import { Uniswap } from './uniswap'
import { Kyber } from './kyber'
import { Arbitrage } from './arbitrage'
import { logger } from './utils/log'
import myasync from 'async';
import { BigNumber } from "@uniswap/sdk";

let pairList = process.env.PAIR_LIST.split("||").map(tokens => tokens.split("=>"))

interface Order {
    dexAddr: String;
    dexIndex: String;
    srcAddr: String;
    srcAmount: String;
    destAddr: String;
}
function paramsFactory(order1: Order, order2: Order): String {
  let params = `${Web3.utils.padLeft(order1.dexAddr,64)}${Web3.utils.padLeft(order1.dexIndex,64).slice(2)}${Web3.utils.padLeft(order1.srcAddr,64).slice(2)}${Web3.utils.padLeft(Web3.utils.toHex(order1.srcAmount),64).slice(2)}${Web3.utils.padLeft(order1.destAddr,64).slice(2)}`;
  let params2 = `${Web3.utils.padLeft(order2.dexAddr,64)}${Web3.utils.padLeft(order2.dexIndex,64).slice(2)}${Web3.utils.padLeft(order2.srcAddr,64).slice(2)}${Web3.utils.padLeft(Web3.utils.toHex(order2.srcAmount),64).slice(2)}${Web3.utils.padLeft(order2.destAddr,64).slice(2)}`;
  
  return `${params}${params2.slice(2)}`
}
// console.log(pairList)
const main = async () => {
    let arUniswap = new Arbitrage("uniswap")
    let arKyber = new Arbitrage("kyber")

    let ethAmount = "1"
    pairList.map(async (o) => {
      console.log(o)
      let uniswapRate = {
        rate: new BigNumber(0),
        rateInverted: new BigNumber(0)
      }
      let uniswapEx: String
      let kyberRate =  {
        rate: new BigNumber(0),
        rateInverted: new BigNumber(0)
      }
      try {

        uniswapRate = await arUniswap.getRate(undefined, "0x6B175474E89094C44Da98b954EedeAC495271d0F")
        // console.log(uniswapRate.rate.toString())
        // console.log(uniswapRate.rateInverted.toString())

      } catch (err) {
        logger.error(`uniswap get rate: ${err}`);
      }
      try {

        kyberRate = await arKyber.getRate('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE','0x6B175474E89094C44Da98b954EedeAC495271d0F', Web3.utils.toWei(ethAmount, "ether"))
        // console.log(kyberRate.rate.toString())
        // console.log(kyberRate.rateInverted.toString())
      } catch (err) {
        logger.error(`kyber get rate: ${err}`);
      }
      try {

        uniswapEx = await arUniswap.getExchange('0x6B175474E89094C44Da98b954EedeAC495271d0F')
      }catch (err) {
        logger.error(`uniswap get exchange: ${err}`);
      }
      let arbitrage = uniswapRate.rate.multipliedBy(ethAmount).multipliedBy(kyberRate.rateInverted).minus(ethAmount)

      if (arbitrage.isPositive() || true) {

          // buy from unsiwap sell to kyber
        let order1 = {
          dexAddr : uniswapEx,
          dexIndex : Web3.utils.toHex('uniswap'),
          srcAddr : '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          srcAmount : Web3.utils.toWei(ethAmount,'ether'),
          destAddr : '0x6B175474E89094C44Da98b954EedeAC495271d0F'

        }
        let order2 = {
          dexAddr : process.env.KYBER_ADDR,
          dexIndex : Web3.utils.toHex('kyber'),
          srcAddr : '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          srcAmount : Web3.utils.toWei('0','ether'),               // default sell all token
          destAddr : '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        } 

        let params = paramsFactory(order1, order2)
        console.log(params)
      } 

        arbitrage = kyberRate.rate.multipliedBy(ethAmount).multipliedBy(uniswapRate.rateInverted).minus(ethAmount)
      if (arbitrage.isPositive()|| true) {
          // buy from kyber sell to uniswap

        let order1 = {
          dexAddr : process.env.KYBER_ADDR,
          dexIndex : Web3.utils.toHex('kyber'),
          srcAddr : '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          srcAmount : Web3.utils.toWei(ethAmount,'ether'),
          destAddr : '0x6B175474E89094C44Da98b954EedeAC495271d0F'
        } 
        let order2 = {
          dexAddr : uniswapEx,
          dexIndex : Web3.utils.toHex('uniswap'),
          srcAddr : '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          srcAmount : Web3.utils.toWei('0','ether'),             // default sell all token
          destAddr : '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

        }

        let params = paramsFactory(order1, order2)
        console.log(params)
      }

    }) 
}



console.log("start arbitraging...")
main()