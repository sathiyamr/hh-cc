import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract EtherStore is ReentrancyGuard {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // bool locked = false;

    function withdraw() nonReentrant  public {
        // require(!locked, "revert");
        // locked = true;
        uint256 bal = balances[msg.sender];
        require(bal > 0);

        (bool sent,) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0;
        // locked = false;
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}


contract Attack {
    EtherStore public etherStore;
    uint256 public constant AMOUNT = 1 ether;

    constructor(address _etherStoreAddress) {
        etherStore = EtherStore(_etherStoreAddress);
    }

    // Fallback is called when EtherStore sends Ether to this contract.
    fallback() external payable {
        if (address(etherStore).balance >= AMOUNT) {
            etherStore.withdraw();
        }
    }

    function attack() external payable {
        require(msg.value >= AMOUNT);
        etherStore.deposit{value: AMOUNT}();
        etherStore.withdraw();
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

/*

What went wrong (step-by-step)

You called Attack.attack() and attached 2 ETH. Inside attack() you did:

etherStore.deposit{value: 1 ether}() — attempts to deposit 1 ETH into EtherStore.

etherStore.withdraw() — calls EtherStore.withdraw() immediately after deposit.

EtherStore.withdraw() sets locked = true and then does the external call (bool sent,) = msg.sender.call{value: bal}("");.

That external call invokes Attack.fallback(), which tries to reenter by calling etherStore.withdraw() again.

The reentered withdraw() fails because locked is true (require(!locked)), so the fallback's call reverts.

Because the fallback reverted, the low-level call in EtherStore returned sent == false, and EtherStore then did require(sent, "Failed to send Ether") → this reverts the entire transaction.

When a transaction reverts, all state changes are rolled back — the deposit never persisted and no ETH moved permanently. The EOA still has its ETH (minus gas).

So: the revert is expected given your code. The extra 1 ETH you attached to the transaction isn't "kept" by Attack because the whole tx reverted.


*/