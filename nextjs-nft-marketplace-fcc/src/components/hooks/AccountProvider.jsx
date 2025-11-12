"use client";
import React, { createContext, useContext, useState } from "react";

// Create the context
const AccountContext = createContext();

// Provider component
export const AccountProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);

  return (
    <AccountContext.Provider
      value={{
        account,
        setAccount,
        provider,
        setProvider,
        chainId,
        setChainId,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

// Hook to use the context
export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};
