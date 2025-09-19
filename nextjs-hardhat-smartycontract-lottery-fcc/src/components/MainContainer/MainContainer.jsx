"use client";
// const { useWeb3Contract, useMoralis } = require("react-moralis");
import React, { useEffect, useState } from "react";
import styles from "./maincontainer.module.css";
import { contractABI, contractAddress } from "../../constants";
import { ethers } from "ethers";
import { useAccount } from "../hooks/AccountProvider";

const MainContainer = () => {
  const { provider, chainId } = useAccount();
  const [entranceFee, setEntranceFee] = useState("0");
  const [noOfPlayers, setNoOfPlayers] = useState(0);
  const [intervalTime, setIntervalTime] = useState(0);
  const [latestTimeStamp, setLatestTimeStamp] = useState(0);
  const [recentWinner, setRecentWinner] = useState(0);
  const [status, setStatus] = useState();

  const enterRaffle = async () => {
    if (entranceFee === "0") {
      console.error("Entrance Fee is not defined yet ");
      return;
    }
    const signer = await provider.getSigner();
    const raffleContract = new ethers.Contract(
      contractAddress[chainId],
      contractABI,
      signer
    );
    const value = ethers.parseEther(entranceFee);
    raffleContract.enterRaffle({ value: value });
  };

  const getNumberOfPlayer = async () => {
    const raffleContract = new ethers.Contract(
      contractAddress[chainId],
      contractABI,
      provider
    );

    const numPlayers = await raffleContract.getNumberOfPlayer();
    setNoOfPlayers(numPlayers.toString());
  };

  const getIntervalTime = async () => {
    const raffleContract = new ethers.Contract(
      contractAddress[chainId],
      contractABI,
      provider
    );

    const interval = await raffleContract.getInterval();
    setIntervalTime(interval.toString());
  };

  const getLatestTimeStamp = async () => {
    const raffleContract = new ethers.Contract(
      contractAddress[chainId],
      contractABI,
      provider
    );

    const timestmp = await raffleContract.getLatestTimeStamp();
    setLatestTimeStamp(timestmp.toString());
  };

  const performUpKeep = async () => {
    // try {
    //   const signer = await provider.getSigner();
    //   const raffleContract = new ethers.Contract(
    //     contractAddress[chainId],
    //     contractABI,
    //     signer
    //   );
    //   // Prepare checkData (same as backend script)
    //   const checkData = keccak256(toUtf8Bytes(""));
    //   // 1️⃣ First check if upkeep is needed (callStatic = read-only, no gas spent)
    //   const { upkeepNeeded } =
    //     await raffleContract.callStatic.checkUpkeep(checkData);
    //   console.log("upkeepNeeded", upkeepNeeded);
    //   if (upkeepNeeded) {
    //     // 2️⃣ Only then perform upkeep
    //     const tx = await raffleContract.performUpkeep(checkData);
    //     const txReceipt = await tx.wait(1);
    //     // 3️⃣ Extract requestId from event logs
    //     const requestId = txReceipt.events[1].args.requestId;
    //     console.log(`Performed upkeep with RequestId: ${requestId}`);
    //   } else {
    //     console.log("No upkeep needed!");
    //   }
    // } catch (error) {
    //   console.error("performUpKeep failed:", error);
    // }
  };

  const getRecentWinner = async () => {
    const raffleContract = new ethers.Contract(
      contractAddress[chainId],
      contractABI,
      provider
    );

    const winner = await raffleContract.getRecentWinner();
    setRecentWinner(winner.toString());
  };

  const getRaffleStatus = async () => {
    const raffleContract = new ethers.Contract(
      contractAddress[chainId],
      contractABI,
      provider
    );

    const raffleSts = await raffleContract.getRaffleState();
    setStatus(raffleSts.toString());
  };

  const listenerForRequestIdOfRandomWords = () => {
    const signer = provider.getSigner();

    const raffleContract = new ethers.Contract(
      contractAddress[chainId],
      contractABI,
      signer
    );

    raffleContract.on("RequestedRaffleWinner", (requestId) => {
      console.log(" RequestId from event:", requestId.toString());
    });
  };

  useEffect(() => {
    async function fetchContractDetails() {
      const raffleContract = new ethers.Contract(
        contractAddress[chainId],
        contractABI,
        provider
      );

      const entranceFee = await raffleContract.getEntranceFee();
      setEntranceFee(ethers.formatEther(entranceFee));

      const numPlayers = await raffleContract.getNumberOfPlayer();
      setNoOfPlayers(numPlayers.toString());
    }
    if (provider && chainId) {
      fetchContractDetails();
      // listenerForRequestIdOfRandomWords();
    }
  }, [provider, chainId]);

  return (
    <div className={styles["main-container"]}>
      <h2>Raffle Dashboard</h2>
      <div className={styles["info-row"]}>
        <span className={styles.label}>No of Players:</span>{" "}
        <span className={styles.value}>{noOfPlayers}</span>
      </div>
      <div className={styles["info-row"]}>
        <span className={styles.label}>Entrance Fee:</span>{" "}
        <span className={styles.value}>{entranceFee}</span>
      </div>
      <div className={styles["info-row"]}>
        <span className={styles.label}>Current Interval:</span>{" "}
        <span className={styles.value}>{intervalTime}</span>
      </div>
      <div className={styles["info-row"]}>
        <span className={styles.label}>Latest Time:</span>{" "}
        <span className={styles.value}>{latestTimeStamp}</span>
      </div>
      <div className={styles["info-row"]}>
        <span className={styles.label}>Raffle Status:</span>{" "}
        <span className={styles.value}>{status}</span>
      </div>
      <div className={styles["info-row"]}>
        <span className={styles.label}>Recent Winner:</span>{" "}
        <span className={styles.value}>{recentWinner}</span>
      </div>

      {entranceFee !== "0" && (
        <>
          <button onClick={enterRaffle}>Enter the Lottery or Raffle</button>
          <button onClick={getNumberOfPlayer}>Refresh Players Count</button>
          <button onClick={getIntervalTime}>Get Time Interval</button>
          <button onClick={getLatestTimeStamp}>Get Last Time Interval</button>
          {noOfPlayers >= 1 && (
            <button onClick={performUpKeep}>
              Perform Upkeep | Get Random Number
            </button>
          )}
          <button onClick={getRecentWinner}>Recent Winner</button>
          <button onClick={getRaffleStatus}>Raffle Status</button>
        </>
      )}
    </div>
  );
};

export default MainContainer;
