const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DeployModule = buildModule("TokenModule", (m) => {
  // const marketPlace = m.contract("MaterialTracking");
  // return marketPlace;
  const qualityCheck = m.contract("MaterialPoSVerification");
  return qualityCheck;
});

module.exports = DeployModule;