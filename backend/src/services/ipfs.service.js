// IPFS Upload / Fetch using Pinata / Web3.Storage
import axios from "axios";
import FormData from "form-data";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_SECRET;

async function uploadToIPFS(fileBuffer, fileName) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const formData = new FormData();
  formData.append("file", fileBuffer, fileName);

  const res = await axios.post(url, formData, {
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET,
    },
  });
  return res.data.IpfsHash;
}

async function fetchFromIPFS(cid) {
  const url = `https://ipfs.io/ipfs/${cid}`;
  const res = await axios.get(url);
  return res.data;
}

export { uploadToIPFS, fetchFromIPFS };
