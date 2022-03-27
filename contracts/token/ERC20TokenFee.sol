// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20TokenFee is ERC20, Ownable {

    event Log(address indexed _from, uint256 indexed etherAmount);
    
    constructor() ERC20(
        "Mock Token", "mToken"
    ){
        uint256 totalSupply = 1000000000 ether; // 1 billion supply
        _mint(
            msg.sender,
            totalSupply
        );
    }

    function transferWithFee(
        address _to,
        uint256 _amount
    ) public payable returns(bool) {
        // Require some amount of ether to be included in the transaction.
        require(
            msg.value >= 123,
            "Reverting: Insufficient Ether"
        );
        address owner = _msgSender();

        _transfer(owner, _to, _amount);
        
        // ERC20 token = ERC20(address(this));

        // (bool success,) = address(token).call{value: 123}(abi.encodeWithSignature(
        //     "_transfer(address,address,uint256)",
        //     owner,
        //     _to,
        //     _amount
        // ));
        // require(
        //     success,
        //     "transfer call failed"
        // );

        return true;
    }

    function transferFromWithFee(
        address _from,
        address _to,
        uint256 _amount
    ) public payable returns(bool) {
        // Require some amount of ether to be included in the transaction.
        require(
            msg.value >= 123,
            "Reverting: Insufficient Ether"
        );

        address spender = _msgSender();

        _spendAllowance(
            _from,
            spender,
            _amount
        );

        _transfer(
            _from,
            _to,
            _amount
        );

        // ERC20 token = ERC20(address(this));

        // (bool successAllowance,) = address(token).call{value: 123}(abi.encodeWithSignature(
        //     "_spendAllowance(address,address,uint256)",
        //     _from,
        //     spender,
        //     _amount
        // ));
        // require(
        //     successAllowance,
        //     "transfer call failed"
        // );

        // (bool successTransfer,) = address(token).call{value: 123}(abi.encodeWithSignature(
        //     "_transfer(address,address,uint256)",
        //     _from,
        //     _to,
        //     _amount
        // ));
        // require(
        //     successTransfer,
        //     "transfer call failed"
        // );

        return true;
    }

    // Disable the original ERC20 transfer functionality
    function transfer(
        address,
        uint256
    ) public pure override returns(bool) {
        return false;
    }

    // Disable the original ERC20 transferFrom functionality
    function transferFrom(
        address,
        address,
        uint256
    ) public pure override returns(bool) {
        return false;
    }

    function contractBalance() public view returns(uint256) {
        return address(this).balance;
    }

    receive() external payable {
        emit Log(msg.sender, msg.value);
    }
}