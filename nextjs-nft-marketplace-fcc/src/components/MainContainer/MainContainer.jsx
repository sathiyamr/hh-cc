"use client";
// const { useWeb3Contract, useMoralis } = require("react-moralis");
import React, { useEffect, useState } from "react";
import styles from "./maincontainer.module.css";
import { contractABI, contractAddress } from "../../constants";
import { ethers } from "ethers";
import { useAccount } from "../hooks/AccountProvider";

const MainContainer = () => {
  return (
    <h1>Main Container</h1>
  )
};

export default MainContainer;
