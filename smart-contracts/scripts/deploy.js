const hre = require("hardhat");

async function main() {
  const SecureShare = await hre.ethers.getContractFactory("SecureShare");
  const ss = await SecureShare.deploy();
  await ss.deployed();
  console.log("SecureShare deployed to:", ss.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
