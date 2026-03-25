/**
 * Fetch encrypted file from IPFS
 * Works with:
 *  - Pinata
 *  - Web3.Storage
 *  - Lighthouse
 *  - Filecoin Gateways
 */

const DEFAULT_GATEWAY = "https://ipfs.io/ipfs/";
// You can replace with your gateway:
// const DEFAULT_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
// const DEFAULT_GATEWAY = "https://dweb.link/ipfs/";

/**
 * Fetch raw data from IPFS by CID
 * @param {string} cid
 * @returns {Promise<string>} encrypted file data
 */
export async function fetchFromIPFS(cid) {
  try {
    const url = `${DEFAULT_GATEWAY}${cid}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`IPFS fetch failed: ${res.statusText}`);
    }

    const data = await res.text();
    return data;
  } catch (err) {
    console.error("IPFS Fetch Error:", err);
    throw err;
  }
}

/**
 * Fetch a file as Blob (images, pdf, etc.)
 * @param {string} cid
 * @returns {Promise<Blob>}
 */
export async function fetchFileBlob(cid) {
  try {
    const url = `${DEFAULT_GATEWAY}${cid}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`IPFS file fetch failed: ${res.statusText}`);
    }

    return await res.blob();
  } catch (err) {
    console.error("IPFS Blob Fetch Error:", err);
    throw err;
  }
}

export default {
  fetchFromIPFS,
  fetchFileBlob
};
