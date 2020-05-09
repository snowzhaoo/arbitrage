pragma solidity ^0.5.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
/**
* @title IUniswapEx interface
* @notice Interface for the Uniswap exchange conttract.
* @author 
* @dev implement this interface to develop a flashloan-compatible flashLoanReceiver contract
**/
interface IKyber {

    function getExpectedRate(IERC20 src, IERC20 dest, uint srcQty) external view returns (uint expectedRate, uint slippageRate);

    /**
    * @notice use token address ETH_TOKEN_ADDRESS for ether
    * @dev makes a trade between src and dest token and send dest token to destAddress
    * @param src Src token
    * @param srcAmount amount of src tokens
    * @param dest   Destination token
    * @param destAddress Address to send tokens to
    * @param maxDestAmount A limit on the amount of dest tokens
    * @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
    * @param walletId is the wallet ID to send part of the fees
    * @return amount of actual dest tokens
    */
    function trade(IERC20 src, uint srcAmount, IERC20 dest, address destAddress, uint maxDestAmount, uint minConversionRate, address walletId) external payable returns(uint);
}