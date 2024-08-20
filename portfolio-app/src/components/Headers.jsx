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
    <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
      
      {/* Address Input on the Left */}
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Enter wallet address"
          value={walletAddress}
          onChange={handleInputChange}
          className={`mr-2 p-2 border border-gray-400 rounded bg-gray-700 text-white ${!isAddressValid ? 'border-red-500' : ''}`}
        />
        <button 
          onClick={validateAddress}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit Address
        </button>
        {!isAddressValid && <span className="text-red-500 ml-2">Invalid Address</span>}
      </div>
      
      {/* Wallet Connect/Disconnect Buttons on the Right */}
      <div className="flex items-center space-x-4">
        {connectedWallet ? (
          <>
            <span className="text-green-500 font-bold">{connectedWallet}</span>
            <button 
              onClick={disconnectWallet} 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Disconnect Wallet
            </button>
          </>
        ) : (
          <button 
            onClick={connectWallet} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default Headers;
