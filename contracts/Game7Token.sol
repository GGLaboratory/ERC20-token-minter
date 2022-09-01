// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Game7Token is ERC20, ERC20Burnable, Ownable, ERC20Capped {
    constructor(address _owner, string memory _name, string memory _symbol, uint _initialSupply, uint _totalSupply) ERC20(_name, _symbol) ERC20Capped(_totalSupply * (10 ** 18))  {
        ERC20._mint(_owner, _initialSupply * (10 ** 18));
    }

    function _mint(address account, uint256 amount) internal override (ERC20, ERC20Capped) {
        require(totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
        ERC20._mint(account, amount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * (10 ** 18));
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != msg.sender);
        _transferOwnership(newOwner);
    }
}