const Locker = artifacts.require('Locker');

contract('Locker facilitator management', accounts => {
    it('should not add an account to the facilitator role if unauthorized', async () => {
        let locker = await Locker.deployed()
        let facilitatorRole = await locker.FACILITATOR_ROLE.call()
        try {
            await locker.grantRole(facilitatorRole, accounts[1], { from : accounts[1]})
            assert.fail('Should not grant role if unauthorized.')
        } catch(e) {
            assert.isTrue(e.message.includes('missing role'))
        }
    })   
    it('should not revoke a role if unauthorized', async () => {
        let locker = await Locker.deployed()
        let facilitatorRole = await locker.FACILITATOR_ROLE.call()
        try {
            await locker.revokeRole(facilitatorRole, accounts[1], { from : accounts[1]})
            assert.fail('Should not revoke role if unauthorized.')
        } catch(e) {
            assert.isTrue(e.message.includes('missing role'))
        }
    })   
    it('should add an account to the facilitator role', async () => {
        let locker = await Locker.deployed()
        let facilitatorRole = await locker.FACILITATOR_ROLE.call()
        await locker.grantRole(facilitatorRole, accounts[1])
        assert.isTrue(await locker.hasRole(facilitatorRole, accounts[1]))
        let facilitators = await locker.getFacilitatorAddresses()
        assert.equal(facilitators.length, 1)
        assert.equal(accounts[1], facilitators[0])
    })  
    it('should add an account only once to the facilitator role', async () => {
        let locker = await Locker.deployed()
        let facilitatorRole = await locker.FACILITATOR_ROLE.call()
        await locker.grantRole(facilitatorRole, accounts[1])
        await locker.grantRole(facilitatorRole, accounts[1])
        assert.isTrue(await locker.hasRole(facilitatorRole, accounts[1]))
        let facilitators = await locker.getFacilitatorAddresses()
        assert.equal(facilitators.length, 1)
        assert.equal(accounts[1], facilitators[0])
    })  
    it('should add an account to the facilitator role, then remove it', async () => {
        let locker = await Locker.deployed()
        let facilitatorRole = await locker.FACILITATOR_ROLE.call()
        await locker.grantRole(facilitatorRole, accounts[1])
        await locker.revokeRole(facilitatorRole, accounts[1])
        assert.isFalse(await locker.hasRole(facilitatorRole, accounts[1]))
        let facilitators = await locker.getFacilitatorAddresses()
        assert.equal(facilitators.length, 0)
    })
})