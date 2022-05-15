import lockerAbi from '../pages/locker-abi.json'
import { ethers } from 'ethers'

const lockerContractAddress = process.env.NEXT_PUBLIC_LOCKER_CONTRACT_ADDRESS

export async function isFacilitator(signer) {
    const facilitators = await getFacilitators(signer)
    const signerAddress = await signer.getAddress()
    return facilitators.includes(signerAddress)
}

export async function getFacilitators(signer) {
    const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)
    const facilitators = await contract.getFacilitatorAddresses()
    return facilitators
}

export async function grantFacilitatorRole(signer, address) {
    const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)
    const roleId = await contract.FACILITATOR_ROLE()
    await contract.grantRole(roleId, address)
}

export async function revokeFacilitatorRole(signer, address) {
    const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)
    const roleId = await contract.FACILITATOR_ROLE()
    await contract.revokeRole(roleId, address)
}

async function findFailureInfo(hash, provider) {
    const tx = await provider.getTransaction(hash)
    try {
        await provider.call({ to: tx.to, data: tx.data }, tx.blockNumber)
    } catch (err) {
        console.log(err)
        return ({ message: err.data.message })
    }
    return ({ message: 'Simulated transaction to isolate reason for its failure, but it was actually successful.' })
}

export async function lockFunds(signer, provider, eventId) {
    const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)
    const amountToLock = await getAmountToLock(signer)
    const txRes = await contract.lockFunds(eventId, { value: amountToLock, gasLimit: 300000 })
    try {
        await txRes.wait()
        return txRes.hash
    } catch(e) {
        const error = await findFailureInfo(txRes.hash, provider)
        throw error
    }
}

export async function getAmountToLock(signer) {
    const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)
    const amountToLock = await contract.amountToLock.call()
    return amountToLock
}

export async function setAmountToLock(signer, provider, newAmountToLock) {
    const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)
    const txRes = await contract.setAmountToLock(newAmountToLock)
    try {
        await txRes.wait()
    } catch(e) {
        const error = await findFailureInfo(txRes.hash, provider)
        throw error
    }
}

export async function getDaoAddress(signer) {
    const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)
    const daoAddress = await contract.daoTreasureAddress.call()
    return daoAddress  
}

export async function setDaoAddress(signer, provider, newDaoAddress) {
    const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)
    const txRes = await contract.setDaoTreasureAddress(newDaoAddress)
    try {
        await txRes.wait()
    } catch(e) {
        const error = await findFailureInfo(txRes.hash, provider)
        throw error
    }
}