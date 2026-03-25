import { grantAccessOnChain } from "../services/blockchain.service.js";

const grantAccess = async (req, res) => {
  try {
    const { cid, wallet } = req.body;
    const txHash = await grantAccessOnChain(cid, wallet);
    res.json({ status: "granted", txHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const revokeAccess = async (req, res) => {
  try {
    const { cid, wallet } = req.body;
    res.json({ status: "revoked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  grantAccess,
  revokeAccess
};
