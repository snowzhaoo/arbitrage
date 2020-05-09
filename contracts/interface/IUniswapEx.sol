pragma solidity ^0.5.0;

/**
* @title IUniswapEx interface
* @notice Interface for the Uniswap exchange conttract.
* @author 
* @dev implement this interface to develop a flashloan-compatible flashLoanReceiver contract
**/
interface IUniswapEx {
    /**
     * @notice Convert ETH to Tokens.
     * @dev User specifies exact input (msg.value) and minimum output.
     * @param _minTokens Minimum Tokens bought.
     * @param deadline Time after which this transaction can no longer be executed.
     * @return Amount of Tokens bought. 
     */

    function ethToTokenSwapInput(uint256 _minTokens, uint256 deadline) external payable returns (uint256);
    /**
     * @notice Convert Tokens to ETH.
     * @dev User specifies exact input and minimum output.
     * @param _tokensSold Amount of Tokens sold.
     * @param _minEth Minimum ETH purchased.
     * @param _deadline Time after which this transaction can no longer be executed.
     * @return Amount of ETH bought.
     */
    function tokenToEthSwapInput(uint256 _tokensSold, uint256 _minEth, uint256 _deadline) external payable returns (uint256);
        /**
    * @notice Convert Tokens to ETH.
    * @dev User specifies maximum input and exact output.
    * @param _ethBought Amount of ETH purchased.
    * @param _maxTokens Maximum Tokens sold.
    * @param _deadline Time after which this transaction can no longer be executed.
    * @return Amount of Tokens sold.
    */
    function tokenToEthSwapOutput(uint256 _ethBought, uint256 _maxTokens, uint256 _deadline) external payable returns (uint256);

    /**
     * @notice Convert ETH to Tokens.
     * @dev User specifies maximum input (msg.value) and exact output.
     * @param _tokensBought Amount of tokens bought.
     * @param _deadline Time after which this transaction can no longer be executed.
     * @return Amount of ETH sold. 
     */
    function ethToTokenSwapOutput(uint256 _tokensBought, uint256 _deadline) external payable returns (uint256);

    /**
     * @notice Convert Tokens (self.token) to Tokens (token_addr).
     * @dev User specifies maximum input and exact output.
     * @param _tokensBought Amount of Tokens (token_addr) bought.
     * @param _maxTokensSold Maximum Tokens (self.token) sold.
     * @param _maxEthSold Maximum ETH purchased as intermediary.
     * @param _deadline Time after which this transaction can no longer be executed.
     * @param _tokenAddr The address of the token being purchased.
     * @return Amount of Tokens (self.token) sold.
     */ 
    function tokenToTokenSwapOutput(uint256 _tokensBought, uint256 _maxTokensSold, uint256 _maxEthSold, uint256 _deadline, address _tokenAddr) external returns (uint256);

    /**
     * @notice Convert Tokens (self.token) to Tokens (token_addr).
     * @dev User specifies exact input and minimum output.
     * @param _tokensSold Amount of Tokens sold.
     * @param _minTokensBought Minimum Tokens (token_addr) purchased.
     * @param _minEthBought Minimum ETH purchased as intermediary.
     * @param _deadline Time after which this transaction can no longer be executed.
     * @param _tokenAddr The address of the token being purchased.
     * @return Amount of Tokens (token_addr) bought.
     */
    function tokenToTokenSwapInput(uint256 _tokensSold, uint256 _minTokensBought, uint256 _minEthBought, uint256 _deadline, address _tokenAddr) external returns (uint256);
}