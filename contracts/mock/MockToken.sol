pragma solidity >=0.4.24;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';
import '@openzeppelin/contracts/GSN/Context.sol';

contract MockToken is Context, ERC20, ERC20Detailed {

	using SafeMath for uint256;

	uint256 CAP = 1000000000;
	uint256 TOTALSUPPLY = CAP.mul(10 ** 18);

    // }
	/**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor (string memory _name, string memory _symbol, uint8 _decimals) ERC20Detailed(_name, _symbol, _decimals) public {
		// ERC20Detailed.initialize("SimpleToken", _symbol, 18);
        _mint(_msgSender(), TOTALSUPPLY);
    }

}