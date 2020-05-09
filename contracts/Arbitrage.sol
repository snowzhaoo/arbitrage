pragma solidity ^0.5.15;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./utils/Withdrawable.sol";
import "./interface/IKyber.sol";
import "./interface/IUniswapEx.sol";

contract Arbitrage is Withdrawable {
    mapping(uint256 => address[]) private dexMap;

    address[] private dexList;
    uint256[] private dexIndex;

    // event BidDexAddr(address dex);
    event BidDex(uint256 dex, address dexAddr);
    event TokenAddr(address src, address dest);
    event Amount(uint256 amount);

    constructor(uint256[] memory _exArray, address[][] memory _tokensArray) public {
        require(_exArray.length > 0, 'Init: ex array should not to be zero');
        require(_exArray.length == _tokensArray.length, 'Init: the ex array length should equal the token array ');

        for(uint256 i = 0; i < _exArray.length; i++) {
            require(_tokensArray[i].length > 0, 'Init: support token array should not to be zero');
            dexMap[_exArray[i]] = _tokensArray[i]; 
            dexIndex.push(_exArray[i]);
        }        
    }

    function addDex(uint256 _ex, address[] calldata _tokens) external onlyOwner {
        require(dexMap[_ex].length == 0, 'Add dex: dex is exist');
        require(_tokens.length > 0, 'Add dex: support token array should not to be zero');

        dexMap[_ex] = _tokens;
        dexIndex.push(_ex);
    }
    function updateDex(uint256 _ex, address[] calldata _tokens) external onlyOwner {
        require(dexMap[_ex].length != 0, 'Add dex: dex is not exist');
        require(_tokens.length > 0, 'Add dex: support token array should not to be zero');

        dexMap[_ex] = _tokens; 
    }
    function getDexTokenList(uint256 _ex) external view returns (address[] memory) {
        return dexMap[_ex];
    }
    function getDexList() external view returns (uint256[] memory) {
        return dexIndex; 
    }

    function _parsingParams(bytes memory _params, uint256 shift) internal returns (address dexAddr, uint256 dexIndex, uint256 srcAmount, address srcAddr, address destAddr) {

            // bytes memory params = _params;

            assembly {
                let startPoint := add(_params, shift)
                let dexAddrPoint := add(startPoint,32)
                let dexIndexPoint := add(dexAddrPoint,32)

                let srcAddrPoint := add(dexIndexPoint, 32)
                let srcAmountPoint := add(srcAddrPoint, 32)
                let destAddrPoint := add(srcAmountPoint, 32)

                dexAddr := mload(dexAddrPoint)
                dexIndex := mload(dexIndexPoint)
                srcAddr := mload(srcAddrPoint)
                srcAmount := mload(srcAmountPoint)
                destAddr := mload(destAddrPoint)

            } 

    }
    function getParams(bytes calldata _params) external {

            address dexAddr;      
            uint256 dexIndex;
            uint256 srcAmount;
            address srcAddr;
            address destAddr;
    
            bytes memory params = _params;

            (dexAddr, dexIndex, srcAmount, srcAddr, destAddr) = _parsingParams(params,0);

            // emit BidDex(dexIndex, dexAddr);
            // emit Amount(srcAmount);
            // emit TokenAddr(srcAddr, destAddr);

            // part 1
            IERC20 srcERC20 = IERC20(srcAddr);
            IERC20 destERC20 = IERC20(destAddr);
            if (dexIndex == 0x6b79626572) {  //kyber

                 //kyber eth => token
                if(address(srcAddr) == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)) {

                    IKyber(dexAddr).trade.value(srcAmount)(srcERC20, srcAmount, destERC20, address(this), 1e18 * 1e18, 1, address(0));
                } else {
                    IERC20(srcAddr).approve(dexAddr, srcAmount);
                    IKyber(dexAddr).trade(srcERC20, srcAmount, destERC20, address(this), 1e18 * 1e18, 1, address(0));
                }
            } else if (dexIndex == 0x756e6973776170) {  //uniswap
                // IERC20(srcAddr).approve(dexAddr, srcAmount);
                if(address(srcAddr) == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)) {   //
                    //token => eth
                    IUniswapEx(dexAddr).ethToTokenSwapInput.value(srcAmount)(1, now + 30 minutes);                
                } else {
                    //token => token
                    IERC20(srcAddr).approve(dexAddr, srcAmount);
                    IUniswapEx(dexAddr).tokenToTokenSwapInput(srcAmount, 1, 1,now + 30 minutes, destAddr);
                }
            }

            //part2
            // when srcAmount = 0 it is default token balance
            (dexAddr, dexIndex, srcAmount, srcAddr, destAddr) = _parsingParams(params, 32 * 5);

            srcERC20 = IERC20(srcAddr);
            destERC20 = IERC20(destAddr);

            emit BidDex(dexIndex, dexAddr);
            emit Amount(srcAmount);
            emit TokenAddr(srcAddr, destAddr);

            if (dexIndex == 0x756e6973776170) {   // uniswap
                IERC20(srcAddr).approve(dexAddr, srcAmount);
                if(address(destAddr) == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)) {   //
                    //token => eth
                    IUniswapEx(dexAddr).tokenToEthSwapInput(srcAmount, 1, now + 30 minutes);                
                } else {
                    //token => token
                    IUniswapEx(dexAddr).tokenToTokenSwapInput(srcAmount, 1, 1,now + 30 minutes, destAddr);
                }

            } else if (dexIndex == 0x6b79626572) {  //kyber
                                //kyber eth => token
                if(address(destAddr) != address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)) {
                    IERC20(srcAddr).approve(dexAddr, srcAmount);
                } 
                IKyber(dexAddr).trade(srcERC20, srcAmount, destERC20, address(this), 1e18 * 1e18, 1, address(0));
            
            }

    }
    function arbitrage() external {

    }
    function () external payable {}
}