# 🎓 SecureShare: Comprehensive Viva Preparation Guide

This document provides a detailed, end-to-end explanation of the **SecureShare** project. Use this guide to prepare for your viva presentation, covering the architecture, tech stack, core workflows, and security features.

---

## 🌟 1. Project Overview
**Name**: SecureShare – Decentralized Encrypted File Sharing
**Core Concept**: A highly secure file storage and sharing platform that combines traditional web technologies with Web3 concepts. It eliminates single points of failure by storing files on a decentralized network (IPFS) and ensures data privacy using military-grade encryption (AES-GCM) alongside blockchain-based access control (Ethereum/Solidity).

### Key Features Explained Simply:
- **No Central Storage Limit**: Files aren't stored on a single server database; they are stored on IPFS.
- **Zero-Knowledge Architecture (Almost)**: Files are encrypted *before* they are sent to IPFS. Even if someone finds the file on IPFS, they cannot read it without the decryption key.
- **Immutable Audit Trails**: Actions like registering a file or granting access are recorded on a blockchain Smart Contract, making them tamper-proof.
- **Tactical Sharing**: A unique feature allowing users to share files securely with non-registered users for a limited time, protected by OTP verification.

---

## 🛠️ 2. Technology Stack (The "What" and "Why")

### Frontend (Client-Side)
- **React.js & Vite**: Used for building a fast, interactive single-page application (SPA). Vite is chosen for extremely fast build times compared to Webpack.
- **State Management / Context**: Used to manage user authentication state globally across the app.
- **Axios**: For making HTTP requests to the backend API.

### Backend (Server-Side)
- **Node.js & Express.js**: Handles API requests, business logic, encryption, and database interactions.
- **MongoDB & Mongoose**: Local/Cloud NoSQL database used to store user profiles, encrypted file metadata (like AES keys, which are stored securely), and logs.
- **JSON Web Tokens (JWT)**: Used for stateless, secure user authentication.

### Security & Decentralization (The Core USP)
- **AES-GCM (Advanced Encryption Standard - Galois/Counter Mode)**: Used to encrypt files. *Why GCM?* It provides both data confidentiality (encryption) and authenticity (tamper-proofing).
- **IPFS (InterPlanetary File System)**: A peer-to-peer network for storing and sharing data in a distributed file system. (Often via gateways like Pinata).
- **Solidity (Ethereum Smart Contracts)**: Used to write the access control logic that is deployed to a blockchain network. It tracks who owns which IPFS CID (Content Identifier) and who is granted access.
- **Ethers.js**: A library used by the backend to talk to the Ethereum blockchain and the deployed smart contract.

---

## 🏗️ 3. System Architecture & Component Interaction

The system consists of three main layers that talk to each other:

1. **User Interface (React)**: Where the user logs in, uploads a file, or manages sharing.
2. **Backend Gateway (Node/Express)**: Acts as the middleman securely handling the heavy lifting (encryption, db saving).
3. **Decentralized Storage & Logic (IPFS & Blockchain)**: The permanent, secure home for the bits and bytes.

### Visualizing the Data Flow
```text
User [React] <---> API [Node.js] <---> Database [MongoDB]
                         |
                         +---> IPFS (File Storage)
                         +---> Ethereum Blockchain (Access Control)
```

---

## 🔄 4. Step-by-Step Core Workflows (How It Works)

If the examiner asks, "Explain what happens when I upload a file," here is your exact answer:

### Flow A: File Upload & Encryption 📤
1. **Initiation**: The user logs into the React frontend and selects a file to upload. This file is sent to the Node.js backend.
2. **Encryption Phase**: The backend receives the file buffer. It generates a unique AES-GCM encryption key and an initialization vector (IV). It encrypts the raw file data using this key.
3. **IPFS Upload**: The *encrypted* file buffer is then uploaded to IPFS (via Pinata/Web3.Storage). IPFS returns a unique hash called a **CID** (Content Identifier).
4. **Blockchain Registration**: The backend uses Ethers.js to call the `registerFile(cid)` function on the Solidity smart contract. This permanently records on the blockchain that this specific user (via their wallet address) is the owner of this CID.
5. **Database Meta-Storage**: The backend saves the AES encryption key (ideally encrypted itself or managed via a KMS), the CID, original filename, and access settings into MongoDB. It returns a success message to the frontend.

### Flow B: File Download & Decryption 📥
1. **Request**: The user clicks 'Download' on the frontend. A request with the file ID is sent to the backend.
2. **Access Verification**:
   - The backend checks MongoDB for the file metadata.
   - It checks the Smart Contract (`hasAccess(cid, userAddress)`) to ensure the user requesting the file is either the owner or has been explicitly granted an access list.
3. **Fetching**: If authorized, the backend uses the CID to fetch the encrypted file from the IPFS network.
4. **Decryption**: The backend retrieves the AES key and IV from the database, decrypts the IPFS buffer back into the original file format.
5. **Delivery**: The decrypted file is streamed/sent back to the user's browser for download.

### Flow C: Tactical Sharing (Secure Guest Access) ⏱️
*This is a standout feature for exams. It shows practical security application.*
1. **Creation**: A file owner generates a "Tactical Share" link. They specify the recipient's email/phone and a time limit (e.g., expires in 24 hours).
2. **Access Attempt**: The recipient opens the unique link.
3. **OTP Verification**: Before the file can be downloaded, the backend sends a One-Time Password (OTP) via Twilio (SMS) or Nodemailer (Email) to the recipient.
4. **Validation**: The recipient enters the OTP. The backend validates the OTP and checks if the time limit has expired.
5. **Secure Delivery**: If valid, the file is fetched, decrypted, and served to the guest user. The link automatically becomes useless after expiration.

---

## 🛡️ 5. Potential Viva Questions & Answers

**Q1: Why did you use both MongoDB and a Smart Contract? Why not just one?**
*Answer:* "MongoDB is used for fast, off-chain querying (like showing a list of files on the dashboard instantly) and storing metadata like encrypted AES keys which shouldn't be public. The Smart Contract is used specifically for immutable access control and audit trails. Putting a database on a blockchain is too slow and expensive; putting access control on a centralized DB defeats the purpose of decentralized trust. We use a hybrid approach to get the best of both."

**Q2: What happens if someone finds my file's CID on the public IPFS network?**
*Answer:* "They will only be able to download a completely scrambled, encrypted file. Because the file is encrypted with AES-GCM *before* it gets sent to IPFS, the raw data never touches the decentralized network. Without the specific AES key stored in our backend, the CID is useless to an attacker."

**Q3: How do you prevent unauthorized users from downloading files through the backend API directly?**
*Answer:* "The backend endpoints are protected by JWT (JSON Web Token) authentication middlewares. Furthermore, every download request verifies the user's identity against the blockchain's `hasAccess` mapping to ensure they have cryptographic permission to access that specific CID."

**Q4: Explain the Smart Contract structure.**
*Answer:* "It’s written in Solidity (`SecureShare.sol`). It contains a `FileRecord` struct tracking a CID and owner address. It uses mappings to keep track of who owns what (`mapping(string => FileRecord) files;`) and who has access (`mapping(string => mapping(address => bool)) access;`). Core functions include `registerFile()` and `grantAccess()`, which emit events for logging."

**Q5: What was the most challenging part of this project?**
*(Tailor this to your actual experience, but here is a good technical one)*
*Answer:* "Synchronizing the state between the centralized MongoDB and the decentralized Smart Contract was challenging. We had to ensure that if a blockchain transaction failed (e.g., out of gas), the database wouldn't show a file as successfully registered, preventing floating, inaccessible files."

---

## 🎯 6. Quick Glossary for Viva
* **CID**: Content Identifier. A unique cryptographic hash returned by IPFS representing the file.
* **AES-GCM**: An authenticated encryption algorithm. Fast, secure, and detects if data was tampered with.
* **Smart Contract**: Self-executing code running on a blockchain.
* **JWT**: A token used to verify who exactly is sending a request to the server.
* **Vite**: A modern, incredibly fast build tool and dev server used instead of Create React App.
* **Pinata**: A pinning service for IPFS, ensuring files don't get deleted from the network when nodes go offline.

Good luck with your presentation! Remember to speak confidently about the fact that this app combines **Speed (React/MongoDB)** with **Security (AES)** and **Trustlessness (Blockchain/IPFS)**.
