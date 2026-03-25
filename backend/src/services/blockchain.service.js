// Handles interaction with Ethereum smart contract via ethers.js
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ABI_PATH = path.join(__dirname, "../../smart-contracts/artifacts/contracts/SecureShare.sol/SecureShare.json");

let provider;
let wallet;
let contract;

function initializeWeb3() {
  if (PRIVATE_KEY && PRIVATE_KEY !== "your_private_key_here") {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  }
}

function loadContract() {
  if (!contract && wallet && CONTRACT_ADDRESS !== "your_contract_address_here") {
    try {
      const json = JSON.parse(fs.readFileSync(ABI_PATH, "utf8"));
      contract = new ethers.Contract(CONTRACT_ADDRESS, json.abi, wallet);
    } catch (err) {
      console.warn("Could not load contract:", err.message);
    }
  }
  return contract;
}

// Register file on blockchain
async function registerFile(cid) {
  const c = loadContract();
  if (!c) {
    console.warn("Blockchain not configured, skipping registration");
    return null;
  }
  const tx = await c.registerFile(cid);
  await tx.wait();
  return tx.hash;
}

// Grant access to another wallet
async function grantAccessOnChain(cid, recipient) {
  const c = loadContract();
  if (!c) {
    console.warn("Blockchain not configured, skipping grant");
    return null;
  }
  const tx = await c.grantAccess(cid, recipient);
  await tx.wait();
  return tx.hash;
}

// Revoke access
async function revokeAccess(cid, recipient) {
  const c = loadContract();
  if (!c) {
    console.warn("Blockchain not configured, skipping revoke");
    return null;
  }
  const tx = await c.revokeAccess(cid, recipient);
  await tx.wait();
  return tx.hash;
}

// Initialize on module load
initializeWeb3();

export { registerFile, grantAccessOnChain, revokeAccess };

