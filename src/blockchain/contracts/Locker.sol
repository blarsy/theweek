// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Locker is Initializable, AccessControlUpgradeable, PausableUpgradeable {
  EnumerableSet.AddressSet private _facilitators;
  uint public amountToLock;
  address payable public daoTreasureAddress;
  uint private nextEventIndex;
  enum LockedFundStatus {
    pending, 
    toBeRefunded,
    refunded,
    toBeSeized,
    seized
  }
  struct LockedFund {
    LockedFundStatus status;
    uint amount;
  }

  mapping(string => uint256) internal eventIndexes;
  mapping(uint256 => string) internal eventByIndex;
  EnumerableSet.UintSet eventsToScanForSeizable;

  // maps events to funds locked by individual addresses
  mapping(string => mapping(address => LockedFund)) public events;
  mapping(string => address[]) public eventAddresses;

  function initialize (address admin, address payable daoTreasure) public initializer {
    AccessControlUpgradeable.__AccessControl_init();
    PausableUpgradeable.__Pausable_init();
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    amountToLock = 6000000000000000000;
    nextEventIndex = 1;
    daoTreasureAddress = daoTreasure;
  }

  function setAmountToLock (uint newAmountInWei) public onlyRole(DEFAULT_ADMIN_ROLE) {
    amountToLock = newAmountInWei;
  }

  bytes32 public constant FACILITATOR_ROLE = keccak256("FACILITATOR_ROLE");
  bytes32 public constant FUNDS_CLERK_ROLE = keccak256("FUNDS_CLERK_ROLE");

  function getFacilitatorAddresses() public view returns(address[] memory) {
    return EnumerableSet.values(_facilitators);
  }

  function _grantRole(bytes32 role, address account) internal override whenNotPaused {
    super._grantRole(role, account);
    if(role == FACILITATOR_ROLE && !EnumerableSet.contains(_facilitators, account)) {
      EnumerableSet.add(_facilitators, account);
    }
  }

  function _revokeRole(bytes32 role, address account) internal override whenNotPaused {
    super._revokeRole(role, account);
    if(role == FACILITATOR_ROLE) {
        EnumerableSet.remove(_facilitators,account);
    }
  }

  function lockFunds(string calldata eventId) public payable whenNotPaused {
    require(msg.value == amountToLock, 'Invalid amount');
    // Checks the same address did not already lock funds for the same event
    require(events[eventId][msg.sender].amount == 0, 'Already locked funds for this event');
    if(eventAddresses[eventId].length == 0) {
      //Need to define a uint index for each event, and a way to get the eventId from its index, and vice versa
      //This is because we want to use a enumerable set to keep track of the events that need 
      //to be seized (otherwise the contract would have to loop each time through all the events ever created)
      //Enumerable sets have no handling of strings, but well of uint, hence the need to map our string event ids to uint's
      eventIndexes[eventId] = nextEventIndex ++;
      eventByIndex[eventIndexes[eventId]] = eventId;
    }
    eventAddresses[eventId].push(msg.sender);
    events[eventId][msg.sender] = LockedFund(LockedFundStatus.pending, msg.value);
  }

  function refund(string calldata eventId) public whenNotPaused {
    LockedFund storage lockedFund= events[eventId][msg.sender];
    address payable target = payable(msg.sender);
    require(lockedFund.amount > 0, 'No locked fund found.');
    require(lockedFund.status == LockedFundStatus.toBeRefunded, 'Funds are not marked as refundable');
    lockedFund.status = LockedFundStatus.refunded;
    target.transfer(lockedFund.amount);
  }

  function finalizeDeposit(string calldata eventId, address[] calldata addressesToRefund) public whenNotPaused {
    require(hasRole(DEFAULT_ADMIN_ROLE ,msg.sender) || hasRole(FUNDS_CLERK_ROLE, msg.sender), 'Unauthorized');
    uint numberOfaddressesToSeize = uint(eventAddresses[eventId].length) - uint(addressesToRefund.length);
    address[] memory addressesToSeize = new address[](numberOfaddressesToSeize);

    for (uint i = 0; i < addressesToRefund.length; i++) {
        if(events[eventId][addressesToRefund[i]].status == LockedFundStatus.pending){
          events[eventId][addressesToRefund[i]].status = LockedFundStatus.toBeRefunded;
        }
    }

    //automatically mark all other addresses as seizable
    bool refunded;
    uint currentToSeizeIndex = 0;
    for (uint i = 0; i < eventAddresses[eventId].length; i ++) {
        refunded = false;
        for (uint j = 0; j < addressesToRefund.length; j ++) {
          if(eventAddresses[eventId][i] == addressesToRefund[j]) {
            refunded = true;
          }
        }
        if(!refunded) {
          addressesToSeize[currentToSeizeIndex] = eventAddresses[eventId][i];
          currentToSeizeIndex = currentToSeizeIndex + 1;
        }
    }
    for (uint i = 0; i < addressesToSeize.length; i++) {
        if(events[eventId][addressesToSeize[i]].status == LockedFundStatus.pending){
          events[eventId][addressesToSeize[i]].status = LockedFundStatus.toBeSeized;
        }
    }
    if(addressesToSeize.length > 0) {
      EnumerableSet.add(eventsToScanForSeizable, eventIndexes[eventId]);
    }
  }

  function withdrawSeizedFundsToDAOTreasure() public whenNotPaused {
    require(hasRole(DEFAULT_ADMIN_ROLE ,msg.sender) || hasRole(FUNDS_CLERK_ROLE, msg.sender), 'Unauthorized');
    uint amountToSeize = 0;
    while(EnumerableSet.length(eventsToScanForSeizable) > 0) {
      uint currentEventIndex = EnumerableSet.at(eventsToScanForSeizable, 0);
      address[] memory currentEventAddresses = eventAddresses[eventByIndex[currentEventIndex]];
      for (uint j = 0; j < currentEventAddresses.length; j ++) {
        if(events[eventByIndex[currentEventIndex]][currentEventAddresses[j]].status == LockedFundStatus.toBeSeized) {
          amountToSeize += events[eventByIndex[currentEventIndex]][currentEventAddresses[j]].amount;
          events[eventByIndex[currentEventIndex]][currentEventAddresses[j]].status = LockedFundStatus.seized;
        }
      }
      EnumerableSet.remove(eventsToScanForSeizable, currentEventIndex);
    }
    if(amountToSeize > 0) {
      daoTreasureAddress.transfer(amountToSeize);
    }
  }

  function pause() public whenNotPaused onlyRole(DEFAULT_ADMIN_ROLE) {
    _pause();
  }

  function unpause() public whenPaused onlyRole(DEFAULT_ADMIN_ROLE) {
    _unpause();
  }

  //Safety method to allow the administrator to set a fund as refundable
  function overrideMakeRefundable(string calldata eventId, address account) public whenNotPaused onlyRole(DEFAULT_ADMIN_ROLE) {
    LockedFund storage lockedFund= events[eventId][account];
    require(lockedFund.amount > 0, 'No locked fund found.');
    require(lockedFund.status != LockedFundStatus.refunded && lockedFund.status != LockedFundStatus.seized, 'Funds have been seized or refunded already.');
    lockedFund.status = LockedFundStatus.toBeRefunded;
  }

  function setDaoTreasureAddress(address payable newDaoTreasureAddress) public whenNotPaused {
    require(hasRole(DEFAULT_ADMIN_ROLE ,msg.sender) || hasRole(FUNDS_CLERK_ROLE, msg.sender), 'Unauthorized');
    daoTreasureAddress = newDaoTreasureAddress;
  }
}
