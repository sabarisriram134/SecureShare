const hre = require("hardhat");

async function main() {
  // Get contract instance
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x..."; // Replace with deployed address
  const SecureShare = await hre.ethers.getContractFactory("SecureShare");
  const contract = SecureShare.attach(contractAddress);

  // Get signer
  const [signer] = await hre.ethers.getSigners();

  // Access grant parameters
  const fileHash = "QmExample..."; // IPFS CID of the file
  const recipientAddress = "0x..."; // Address to grant access to
  const accessLevel = 1; // 0 = view, 1 = download, 2 = admin

  console.log(`Granting access to file: ${fileHash}`);
  console.log(`Recipient: ${recipientAddress}`);
  console.log(`Access Level: ${accessLevel}`);

  try {
    // Call grantAccess on contract
    const tx = await contract.grantAccess(fileHash, recipientAddress, accessLevel);
    console.log(`Transaction hash: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`✓ Access granted in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // Verify access was granted
    const hasAccess = await contract.hasAccess(fileHash, recipientAddress);
    console.log(`✓ Access verified: ${hasAccess}`);
  } catch (error) {
    console.error("Failed to grant access:", error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
