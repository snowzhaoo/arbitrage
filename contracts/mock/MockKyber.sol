pragma solidity >=0.4.24;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockKyber {
    using SafeMath for uint256;
    uint256 rate;
    uint256 slippage;
    // address token;

    constructor(uint256 _rate, uint256 _slippage) public {
        // token = _token;
        rate = _rate;
        slippage = _slippage;
    }

    function getExpectedRate(ERC20 _src, ERC20 _dest, uint _srcQty) external view returns (uint expectedRate, uint slippageRate) {
        return (rate, slippage);
    }
    function trade(ERC20 _src, uint _srcAmount, ERC20 _dest, address _destAddress, uint _maxDestAmount, uint _minConversionRate, address _walletId) external payable returns(uint) {
        if (address(_src) == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
            require(msg.value != 0);
            require(_dest.transfer(msg.sender, msg.value.mul(rate).div(1e18)));

            return msg.value.mul(rate).div(1e18);
        } else {
            _src.transferFrom(msg.sender, address(this), _srcAmount);
            require(_dest.transfer(msg.sender, _srcAmount.mul(rate).div(1e18)));

            return _srcAmount.mul(rate).div(1e18);
        }
    }
    function () external payable {}
}