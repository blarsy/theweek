const Locker = artifacts.require('Locker');

const amountToLock = web3.utils.toWei('6', 'ether')

contract('Locker funds management', accounts => {
    it('should lock exactly 6 Matics', async () =>  {
        const locker = await Locker.deployed()
        const eventId = 'event'
        await locker.lockFunds(eventId, {from: accounts[3], value: web3.utils.toWei('6', 'ether')})
        const lockedFund = await locker.events.call(eventId, accounts[3])
        assert.equal(lockedFund.amount, amountToLock)
        assert.equal(lockedFund.status, Locker.LockedFundStatus.pending)
        assert.equal(await locker.eventAddresses.call(eventId, 0), accounts[3])
        assert.equal(amountToLock, await web3.eth.getBalance(locker.address))
    })
    it('should fail to lock anything else than exactly 6 Matics', async () =>  {
        const locker = await Locker.deployed()
        const eventId = 'event'
        try {
            await locker.lockFunds(eventId, {from: accounts[3], value: 5})
            assert.fail('Should not allow locking that amount of fund')
        } catch(e) {
            assert.isTrue(e.message.includes('Invalid amount'))
        }
    })
    it('should fail locking funds twice for the same event', async () =>  {
        const locker = await Locker.deployed()
        const eventId = 'event'
        try {
            await locker.lockFunds(eventId, {from: accounts[3], value: amountToLock})
            assert.fail('Should not allow locking twice for the same event')
        } catch(e) {
            assert.isTrue(e.message.includes('Already locked'))
        }
    })
    it('should not finalize event if unauthorized', async () =>  {
        let locker = await Locker.deployed()
        try {
            await locker.finalizeDeposit('event', [], { from : accounts[3]});
            assert.fail('Should not refund if unauthorized.')
        } catch(e) {
            assert.isTrue(e.message.includes('Unauthorized'))
        }
    })
    it('should finalize a given event', async () =>  {
        let locker = await Locker.deployed()
        let fundClerkRole = await locker.FUNDS_CLERK_ROLE.call()
        const eventId = 'event1'
        await locker.lockFunds(eventId, {from: accounts[3], value: amountToLock})
        await locker.lockFunds(eventId, {from: accounts[4], value: amountToLock})
        await locker.lockFunds(eventId, {from: accounts[5], value: amountToLock})
        await locker.grantRole(fundClerkRole, accounts[2])
        await locker.finalizeDeposit(eventId, [accounts[4]], { from : accounts[2]})
        const lockedFund = await locker.events.call(eventId, accounts[4])
        assert.equal(lockedFund.status, Locker.LockedFundStatus.toBeRefunded)
        const lockedFund1 = await locker.events.call(eventId, accounts[3])
        assert.equal(lockedFund1.status, Locker.LockedFundStatus.toBeSeized)
        const lockedFund2 = await locker.events.call(eventId, accounts[5])
        assert.equal(lockedFund2.status, Locker.LockedFundStatus.toBeSeized)
    })
    it('should not mark fund as refundable if unauthorized', async() => {
        let locker = await Locker.deployed()
        const eventId = 'event'
        try {
            await locker.overrideMakeRefundable(eventId, accounts[4], { from: accounts[4]})
            assert.fail('Should not allow marking as refundable.')
        } catch(e){
            assert.isTrue(e.message.includes('AccessControl'))
        }
    })
    it('should not mark fund as refundable if no fund were locked', async() => {
        let locker = await Locker.deployed()
        const eventId = 'event'
        try {
            await locker.overrideMakeRefundable(eventId, accounts[4])
            assert.fail('Should not allow marking as refundable.')
        } catch(e){
            assert.isTrue(e.message.includes('No locked fund found.'))
        }
    })
    it('should not mark fund as refundable if fund were already seized', async() => {
        let locker = await Locker.deployed()
        const eventId = 'event3'
        await locker.lockFunds(eventId, {from: accounts[4], value: amountToLock})
        await locker.finalizeDeposit(eventId, [], {from: accounts[0]})
        await locker.withdrawSeizedFundsToDAOTreasure({ from: accounts[0]})

        try {
            await locker.overrideMakeRefundable(eventId, accounts[4])
            assert.fail('Should not allow marking as refundable.')
        } catch(e){
            assert.isTrue(e.message.includes('Funds have been seized or refunded already'))
        }
    })
    it('should not mark fund as refundable if fund were already refunded', async() => {
        let locker = await Locker.deployed()
        const eventId = 'event4'
        await locker.lockFunds(eventId, {from: accounts[4], value: amountToLock})
        await locker.finalizeDeposit(eventId, [accounts[4]], {from: accounts[0]})
        await locker.refund(eventId, { from: accounts[4] })

        try {
            await locker.overrideMakeRefundable(eventId, accounts[4])
            assert.fail('Should not allow marking as refundable.')
        } catch(e){
            assert.isTrue(e.message.includes('Funds have been seized or refunded already'))
        }
    })
    it('should set a fund as refundable', async() => {
        let locker = await Locker.deployed()
        const eventId = 'event'
        await locker.lockFunds(eventId, {from: accounts[4], value: amountToLock})
        await locker.overrideMakeRefundable(eventId, accounts[4])
        const lockedFund = await locker.events.call(eventId, accounts[4])
        assert.equal(lockedFund.amount, amountToLock)
        assert.equal(lockedFund.status, Locker.LockedFundStatus.toBeRefunded)
    })
})
contract('Locker funds management - seizing', accounts => {
    contract('Locker funds management - seizing - unhappy pathes', accounts => {
        it('should not seize if unauthorized', async() => {
            let locker = await Locker.deployed()
            let fundClerkRole = await locker.FUNDS_CLERK_ROLE.call()
            const eventId = 'event2'
            await locker.lockFunds(eventId, {from: accounts[3], value: amountToLock})
            await locker.lockFunds(eventId, {from: accounts[4], value: amountToLock})
            await locker.grantRole(fundClerkRole, accounts[2])
            await locker.finalizeDeposit(eventId, [accounts[4]], { from : accounts[2] })
            try {
                await locker.withdrawSeizedFundsToDAOTreasure({ from: accounts[3]})
                assert.fail('Should not allow seizing funds.')
            } catch(e) {
                assert.isTrue(e.message.includes('Unauthorized'))
            }
        })
    })
    it('should seize adresses to be seized', async () =>  {
        let locker = await Locker.deployed()
        let fundClerkRole = await locker.FUNDS_CLERK_ROLE.call()
        const eventId = 'event2'
        await locker.lockFunds(eventId, {from: accounts[3], value: amountToLock})
        await locker.lockFunds(eventId, {from: accounts[4], value: amountToLock})
        await locker.lockFunds(eventId, {from: accounts[5], value: amountToLock})
        await locker.grantRole(fundClerkRole, accounts[2])
        await locker.setDaoTreasureAddress(accounts[6], { from : accounts[2] })
        await locker.finalizeDeposit(eventId, [accounts[4]], { from : accounts[2] })
        const initialBalance = await web3.eth.getBalance(accounts[6])
        await locker.withdrawSeizedFundsToDAOTreasure({ from: accounts[2]})
        const lockedFund1 = await locker.events.call(eventId, accounts[3])
        assert.equal(lockedFund1.status, Locker.LockedFundStatus.seized)
        const lockedFund2 = await locker.events.call(eventId, accounts[5])
        assert.equal(lockedFund2.status, Locker.LockedFundStatus.seized)
        const newBalance = await web3.eth.getBalance(accounts[6])
        const expectedNewBalance = new web3.utils.BN(initialBalance).add(new web3.utils.BN('12000000000000000000'))
       assert.equal(new web3.utils.BN(expectedNewBalance).toString(10),  new web3.utils.BN(newBalance).toString(10))
    })
})