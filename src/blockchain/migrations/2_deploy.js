var Locker = artifacts.require("Locker");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Locker)
  let locker = await Locker.deployed()
  locker.initialize(accounts[0], accounts[9])
};