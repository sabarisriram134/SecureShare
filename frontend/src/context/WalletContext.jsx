import React, { createContext, useContext, useEffect, useState } from "react";

const WalletContext = createContext({ account: null, connect: async () => {} });

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts && accounts.length) setAccount(accounts[0]);
      });
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts && accounts.length ? accounts[0] : null);
      });
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accs[0]);
  };

  return (
    <WalletContext.Provider value={{ account, connect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
