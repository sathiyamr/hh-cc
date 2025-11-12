import React, { useEffect } from "react";
// import { useMoralis } from "react-moralis";
import "./Header.css";

const Header = () => {
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
        {!isWeb3Enabled && (
          <button onClick={() => enableWeb3()} disabled={isWeb3EnableLoading}>
            Connect
          </button>
        )}
        {account && (
          <>
            <p>Connected to {account}</p>
            <button onClick={() => deactivateWeb3()}>Deactive </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
