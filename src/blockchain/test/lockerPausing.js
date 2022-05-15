const Locker = artifacts.require('Locker');

const assertFailsBecausePaused = async action =>  {
    try {
        await action
        assert.fail('Should not be able to call anymore when paused')
    }
    catch(e) {
        assert.isTrue(e.message.includes('paused'))
    }
}

contract('Locker pausable', accounts => {
    it('should not be pausable from unauthorized account', async () => {
        const locker = await Locker.deployed()
        try {
            await locker.pause({ from: accounts[1]})
            assert.fail('Should not allow pausing with unauthorized account')
        } catch(e) {
            assert.isTrue(e.message.includes('missing role'))
        }
    })
    it('should be pausable', async () => {
        const locker = await Locker.deployed()
        await locker.pause({ from: accounts[0]})
        let facilitatorRole = await locker.FACILITATOR_ROLE.call()
        await assertFailsBecausePaused(locker.lockFunds('event', {from: accounts[3]}))
        await assertFailsBecausePaused(locker.grantRole(facilitatorRole, accounts[1]))
        await assertFailsBecausePaused(locker.revokeRole(facilitatorRole, accounts[1]))
    })
})
contract('Locker unpausable', accounts => {
    it('should be unpausable', async () => {
        const locker = await Locker.deployed()
        await locker.pause({ from: accounts[0]})
        await assertFailsBecausePaused(locker.lockFunds('event', {from: accounts[3]}))
        await locker.unpause({ from: accounts[0] })
        await locker.lockFunds('event', {from: accounts[3], value: web3.utils.toWei('6', 'ether')})
    })
})