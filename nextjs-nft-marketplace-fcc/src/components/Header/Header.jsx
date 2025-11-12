"use client";
import React, { useState, useEffect } from "react";
import styles  from "./header.module.css";
import { ethers, getAddress } from "ethers";
import { useAccount } from "../hooks/AccountProvider";
import Link from "next/link";

const Header = () => {
  const { account, setAccount, provider, setProvider, chainId, setChainId } =
    useAccount();

  const getAndSetChainId = async () => {
    const network = await provider.getNetwork();
    console.log("Chain ID:", network.chainId);
    setChainId(network.chainId);
  };

  useEffect(() => {
    if (provider) {
      getAndSetChainId();
    }
  }, [provider]);

  const loadAccount = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = getAddress(accounts[0]);
    setAccount(account);
  };
  useEffect(() => {
    if (!window.ethereum) {
      console.error("MetaMask not installed");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    const handleAccountsChanged = (accounts) => {
      console.log("Accounts changed:", accounts);
      if (accounts.length > 0) {
        setAccount(getAddress(accounts[0]));
      } else {
        setAccount(null); // disconnected
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <header
      style={{
        padding: "1rem",
        background: "#6366f1",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <h1>Header</h1>
      <div className="connect-container">
        {account ? (
          <>Connected: {account.slice(0, 6) + "..." + account.slice(38, 42)}</>
        ) : (
          <>
            <button onClick={loadAccount}>Connect ?</button>
          </>
        )}
      </div>
      <nav className={styles.navbar}>
        <div className={styles.menu}>
          <Link href="/" className={styles.menuItem}>
            Home
          </Link>
          <Link href="/sell-nft" className={styles.menuItem}>
            Sell NFT
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
