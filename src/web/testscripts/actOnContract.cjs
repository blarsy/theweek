const lockerAbi = require('../pages/locker-abi.json')
const { ethers } = require('ethers')

// const lockerContractAddress = '0x240a5a2f6FDc8528B37D2b07b89a3461844D0Cb1'
// const provider = new ethers.providers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com')
// const signer = new ethers.Wallet('58d5932479516eda724116f8d310a4d435c25444133fd6e81a5c40775fc869fb', provider)
const lockerContractAddress = '0xeD1b172ee1850Bb6a3F2861Ac253835Faa070aEE'
const provider = new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:7545')
const signer = new ethers.Wallet('df21828e8f0438c6d64013b00adb94b8d461405bf61c7278769aa8391af927a1', provider)

const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)

async function operations () {
    const daoAddress = await contract.daoTreasureAddress.call()
    console.log(daoAddress.toString())
}


async function findFailureInfo(hash) {
    const tx = await provider.getTransaction(hash)
    try {
        await provider.call({ to: tx.to, data: tx.data }, tx.blockNumber)
    } catch (err) {
        console.log(err)
        return ({ message: err.data.message })
    }
    return ({ message: 'Simulated transaction to isolate reason for its failure, but it was actually successful.' })
}

operations().then(()=> console.log('Done'))


//contract.initialize('0xB28865eBC958027941175EF0180cb6ed77283608')