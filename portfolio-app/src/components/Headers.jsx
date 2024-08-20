import React, { useState } from "react";
import { ethers } from "ethers"; // Import ethers.js

const Headers = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [isAddressValid, setIsAddressValid] = useState(true); // State to track address validity

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnectedWallet(accounts[0]);
        setWalletAddress(""); // Clear manual input if MetaMask is connected
      } catch (error) {
        console.error("Connection failed", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet(null);
  };

  const handleInputChange = (e) => {
    setWalletAddress(e.target.value);
    setIsAddressValid(true); // Reset validity when typing
  };

  const validateAddress = () => {
    if (ethers.utils.isAddress(walletAddress)) {
      console.log("Wallet address is valid:", walletAddress);
      // You can proceed with this address
    } else {
      setIsAddressValid(false); // Set validity to false if address is not valid
    }
  };

  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold mr-4">Crypto Portfolio</h1>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Enter wallet address"
            value={walletAddress}
            onChange={handleInputChange}
            className={`mr-2 px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500 ${
              !isAddressValid ? 'border-red-500' : ''
            }`}
          />
          <button
            onClick={validateAddress}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
          >
            Submit Address
          </button>
          {!isAddressValid && (
            <span className="text-red-500 ml-2">Invalid Address</span>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {connectedWallet ? (
          <>
            <span className="text-green-500 font-bold mr-4">
              {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
            </span>
            <button
              onClick={disconnectWallet}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Headers;