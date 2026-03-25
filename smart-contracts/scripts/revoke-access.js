const hre = require("hardhat");

async function main() {
  // Get contract instance
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x..."; // Replace with deployed address
  const SecureShare = await hre.ethers.getContractFactory("SecureShare");
  const contract = SecureShare.attach(contractAddress);

  // Get signer
  const [signer] = await hre.ethers.getSigners();

  // Revoke parameters
  const fileHash = "QmExample..."; // IPFS CID of the file
  const userAddress = "0x..."; // Address to revoke access from

  console.log(`Revoking access for file: ${fileHash}`);
  console.log(`User: ${userAddress}`);

  try {
    // Call revokeAccess on contract
    const tx = await contract.revokeAccess(fileHash, userAddress);
    console.log(`Transaction hash: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`✓ Access revoked in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // Verify access was revoked
    const hasAccess = await contract.hasAccess(fileHash, userAddress);
    console.log(`✓ Access revoked verified: ${!hasAccess}`);
  } catch (error) {
    console.error("Failed to revoke access:", error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
