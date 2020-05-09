"use strict";

import { getTokenReserves,getMarketDetails,SUPPORTED_CHAIN_ID, BigNumber} from '@uniswap/sdk'
// import { TokenReservesNormalized } from '@uniswap/sdk/dist/types'
const taker_fee = 0.003
export {SUPPORTED_CHAIN_ID}
interface token{
    chainId: number
    address: string
    decimals: number
}

export class Uniswap{
    network: SUPPORTED_CHAIN_ID 

    constructor(network: SUPPORTED_CHAIN_ID) {
      this.network = network
    }
    async getRate(inputTokenAddress: string ,outputTokenAddress: string, network: number = 1): Promise<{rate: BigNumber, rateInverted: BigNumber}> {
        if (inputTokenAddress == undefined && outputTokenAddress == undefined) {
            return {
                rate: new BigNumber(0),
                rateInverted: new BigNumber(0)
            }
        } 
        try {
            let inputTokenReserves = inputTokenAddress == undefined ? undefined: await getTokenReserves(inputTokenAddress, this.network)
            let outputTokenReserves = outputTokenAddress == undefined ? undefined: await getTokenReserves(outputTokenAddress, this.network)
            const marketDetails = getMarketDetails(inputTokenReserves, outputTokenReserves); 
            return marketDetails.marketRate;
        } catch (err) {
            //TODO add log
            return {
                rate: new BigNumber(0),
                rateInverted: new BigNumber(0)
            }
        }
    }
    async getExchange(tokenAddr: string): Promise<string> {
        let reserve = await getTokenReserves(tokenAddr, this.network)
        return reserve.exchange.address
    }
    calcFee(tokenAddress: string): number {
        return taker_fee
    }
}