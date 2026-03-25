const hre = require("hardhat");

async function main() {
  // Get contract instance (assumes already deployed)
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x..."; // Replace with deployed address
  const SecureShare = await hre.ethers.getContractFactory("SecureShare");
  const contract = SecureShare.attach(contractAddress);

  // Get signer (deployer account)
  const [signer] = await hre.ethers.getSigners();

  // File metadata
  const fileHash = "QmExample..."; // IPFS CID
  const fileName = "document.pdf";
  const fileSize = 1024 * 100; // 100 KB
  const encryptionKey = "0x" + "a".repeat(64); // 32-byte key as hex

  console.log(`Registering file: ${fileName}`);
  console.log(`File Hash (CID): ${fileHash}`);
  console.log(`File Size: ${fileSize} bytes`);

  try {
    // Call registerFile on contract
    const tx = await contract.registerFile(fileHash, fileName, fileSize, encryptionKey);
    console.log(`Transaction hash: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`✓ File registered in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  } catch (error) {
    console.error("Failed to register file:", error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
