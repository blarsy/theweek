const Locker = artifacts.require('Locker');

const amountToLock = web3.utils.toWei('6', 'ether')

contract('Locker admin settings', accounts => {
    it('should not change the amount of wei to lock if unauthorized', async() => {
        let locker = await Locker.deployed()
        const eventId = 'event'
        try {
            await locker.setAmountToLock('4000000000000000000', { from : accounts[1] })
            assert.fail('Should refuse to change the amont to lock')
        } catch(e){
            assert.isTrue(e.message.includes('AccessControl'))
        }
    })
    it('should change the amount of wei to lock', async() => {
        let locker = await Locker.deployed()
        const eventId = 'event'
        await locker.setAmountToLock('4000000000000000000')
        try {
            await locker.lockFunds(eventId, {from: accounts[6], value: amountToLock})
            assert.fail('Should refuse to lock this amount (we should have changed it')
        } catch(e){
            assert.isTrue(e.message.includes('Invalid amount'))
        }
        await locker.lockFunds(eventId, {from: accounts[6], value: '4000000000000000000'})
        const lockedFund = await locker.events.call(eventId, accounts[6])
        assert.equal(lockedFund.amount, '4000000000000000000')
        assert.equal(lockedFund.status, Locker.LockedFundStatus.pending)
    })
    it('should not change the Dao treasury address if unauthorized', async() => {
        let locker = await Locker.deployed()
        try {
            await locker.setDaoTreasureAddress(accounts[6], { from : accounts[1] })
            assert.fail('Should refuse to change the Dao treasury address')
        } catch(e){
            assert.isTrue(e.message.includes('Unauthorized'))
        }
    }) 
})