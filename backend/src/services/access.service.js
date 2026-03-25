// Grant/Revoke logic for file access
const blockchainService = require("./blockchain.service");

// Example in-memory storage for demonstration
const accessMap = {}; // { cid: [wallet1, wallet2] }

function getAccessList(cid) {
  return accessMap[cid] || [];
}

async function grantAccess(cid, walletAddress) {
  if (!accessMap[cid]) accessMap[cid] = [];
  if (!accessMap[cid].includes(walletAddress)) {
    accessMap[cid].push(walletAddress);
    const txHash = await blockchainService.grantAccess(cid, walletAddress);
    return txHash;
  }
  return null;
}

async function revokeAccess(cid, walletAddress) {
  if (!accessMap[cid]) return null;
  accessMap[cid] = accessMap[cid].filter((w) => w !== walletAddress);
  const txHash = await blockchainService.revokeAccess(cid, walletAddress);
  return txHash;
}

module.exports = { grantAccess, revokeAccess, getAccessList };
