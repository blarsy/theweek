# Contracts design
## DepositBox
### Public methods

| Method | Callable by | Description |
| --- | --- | --- |
| lock(address) | Everyone | Accepts 6 matics in order to keep it locked within the contract. Fails if any other number of Matics are sent to the method |
| addFacilitator(newFacilitatorAddress) | admin role | Allows the owner of the provided address to execute facilitator-restricted operations |
removeFacilitator(existingFacilitatorAddress) | admin role | Revoke facilitator access from the provided address |
| finalizeWatchParty(participantsLockingTxs, defectorsLockingTxs) | facilitator - admin | Refund the participants locked Matics, mint 1 THEWEEK token to each participants, and mint 2 THEWEEK tokens for the facilitator. Works by analyzing the original locking transactions to ensure all data (amount Matics, receiving address) is correct. Participants who did not show up during the watch party are simply not provided in the lockingTx array parameter |

## Other contracts

Several products (Colony, DaoHaus, OpenZeppelin, ...) are being evaluated, more to come.