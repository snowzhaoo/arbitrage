pragma solidity >=0.4.24;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockUniswap {
    
    using SafeMath for uint256;
    uint256 rate;
    address token;

    constructor(address _token, uint256 _rate) public {
        token = _token;
        rate = _rate;
	}

    function getExchange(address _token) external view returns (address) {
        return address(this);
    }

    function getEthToTokenOutputPrice(uint256 _tokensBought) external view returns (uint256) {
        return _tokensBought.mul(1e18).div(rate);
    }

    function getTokenToEthInputPrice(uint256 _tokensSold) external view returns (uint256) {
        return _tokensSold.mul(1e18).div(rate);
    }
    function ethToTokenSwapInput(uint256 _minTokens, uint256 _deadline) external payable returns (uint256) {
        IERC20(token).transfer(msg.sender, msg.value.mul(rate).div(1e18));
        return msg.value.mul(rate); 
    }

    function tokenToEthSwapInput(uint256 _tokensSold, uint256 _minEth, uint256 _deadline) external returns (uint256){
        require(IERC20(token).transferFrom(msg.sender, address(this), _tokensSold));
        msg.sender.transfer(_tokensSold.mul(1e18).div(rate));
        return _tokensSold.mul(1e18).div(rate) ;
    }

    function ethToTokenSwapOutput(uint256 _tokensBought, uint256 _deadline) external payable  returns (uint256) {

        IERC20(token).transfer(msg.sender, _tokensBought);
        msg.sender.transfer(msg.value.sub(_tokensBought.mul(1e18).div(rate)));

        return _tokensBought.mul(1e18).div(rate); 
    }
    function tokenToEthSwapOutput(uint256 _ethBought, uint256 _maxTokens, uint256 _deadline) external returns (uint256){

        require(IERC20(token).transferFrom(msg.sender, address(this), _ethBought.mul(rate).div(1e18)));
        msg.sender.transfer(_ethBought);
        return _ethBought.mul(rate).div(1e18) ;
    }
    function tokenToTokenSwapOutput(uint256 _tokensBought, uint256 _maxTokensSold, uint256 _maxEthSold, uint256 _deadline, address _tokenAddr) external returns (uint256){

        require(IERC20(token).transferFrom(msg.sender, address(this), _tokensBought.mul(rate).div(1e18)));
        IERC20(_tokenAddr).transfer(msg.sender, _tokensBought);
        return _tokensBought.mul(rate).div(1e18);
    }
    function tokenToTokenSwapInput(uint256 _tokensSold, uint256 _minTokensBought, uint256 _minEthBought, uint256 _deadline, address _tokenAddr) external returns (uint256){

        require(IERC20(token).transferFrom(msg.sender, address(this), _tokensSold));
        IERC20(_tokenAddr).transfer(msg.sender, _tokensSold.mul(1e18).div(rate));
        return _tokensSold.mul(1e18).div(rate);

    }
    function () external payable {}
}
