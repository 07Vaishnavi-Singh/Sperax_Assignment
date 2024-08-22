import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import OperationsBar from './OperationsBar';
import Allowance from './Allowance';
import Approval from './Approval';
import Transfer from './Transfer';
import TokenWatchList from "./TokenWatchList";

// ABI for ERC20 token interface
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
];

const Headers = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [isAddressValid, setIsAddressValid] = useState(true);
  const [tokens, setTokens] = useState([]);
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAddress, setActiveAddress] = useState("");
  const [activeOperation, setActiveOperation] = useState(null);

  useEffect(() => {
    const newProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(newProvider);
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnectedWallet(accounts[0]);
        setActiveAddress(accounts[0]);
        setWalletAddress("");
        fetchTokenBalances(accounts[0]);
      } catch (error) {
        console.error("Connection failed", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet(null);
    setActiveAddress("");
    setTokens([]);
  };

  const handleInputChange = (e) => {
    setWalletAddress(e.target.value);
    setIsAddressValid(true);
  };

  const validateAddress = () => {
    if (ethers.utils.isAddress(walletAddress)) {
      console.log("Wallet address is valid:", walletAddress);
      setIsAddressValid(true);
      setActiveAddress(walletAddress);
      fetchTokenBalances(walletAddress);
    } else {
      setIsAddressValid(false);
    }
  };

  const fetchTokenBalances = async (address) => {
    if (!provider) return;
    setIsLoading(true);

    try {
      // Fetch ETH balance
      const ethBalance = await provider.getBalance(address);
      const ethBalanceInEther = ethers.utils.formatEther(ethBalance);

      // Fetch token transfer events
      const abi = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
      const iface = new ethers.utils.Interface(abi);
      
      const logs = await provider.getLogs({
        fromBlock: 0,
        toBlock: "latest",
        topics: [
          ethers.utils.id("Transfer(address,address,uint256)"),
          null,
          ethers.utils.hexZeroPad(address, 32)
        ]
      });

      const tokenAddresses = [...new Set(logs.map(log => log.address))];

      const tokenPromises = tokenAddresses.map(async (tokenAddress) => {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        try {
          const balance = await tokenContract.balanceOf(address);
          const symbol = await tokenContract.symbol();
          const name = await tokenContract.name();
          const decimals = await tokenContract.decimals();
          const adjustedBalance = ethers.utils.formatUnits(balance, decimals);
          return { name, symbol, balance: adjustedBalance };
        } catch (error) {
          console.error(`Error fetching token info for ${tokenAddress}:`, error);
          return null;
        }
      });

      const tokenBalances = (await Promise.all(tokenPromises)).filter(token => token !== null);
      setTokens([{ name: "Ethereum", symbol: 'ETH', balance: ethBalanceInEther }, ...tokenBalances]);
    } catch (error) {
      console.error("Error fetching token balances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActiveOperation = () => {
    switch(activeOperation) {
      case 'addToken':
        return <TokenWatchList />;
      case 'allowance':
        return <Allowance />;
      case 'approval':
        return <Approval />;
      case 'transfer':
        return <Transfer />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="py-6 px-8 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Crypto Portfolio</h1>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          {activeAddress && (
            <span className="text-green-500 font-bold">
              {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
            </span>
          )}
          <input
            type="text"
            placeholder="Enter wallet address"
            value={walletAddress}
            onChange={handleInputChange}
            className={`px-4 py-2 rounded-lg bg-gray-800 border ${
              !isAddressValid ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:border-blue-500`}
          />
          <button
            onClick={validateAddress}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Submit Address
          </button>
          {connectedWallet ? (
            <button
              onClick={disconnectWallet}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* OperationsBar added here */}
      <OperationsBar setActiveOperation={setActiveOperation} />

      {!isAddressValid && (
        <p className="text-red-500 text-center mt-4">Invalid Address</p>
      )}
      {isLoading && (
        <div className="text-center mt-8">
          <p className="text-xl">Loading token balances...</p>
        </div>
      )}
      {tokens.length > 0 && (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Token Holdings</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-2 text-left">Token</th>
                  <th className="px-4 py-2 text-left">Symbol</th>
                  <th className="px-4 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="px-4 py-2">{token.name}</td>
                    <td className="px-4 py-2">{token.symbol}</td>
                    <td className="px-4 py-2 text-right">{parseFloat(token.balance).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-8">
        {renderActiveOperation()}
      </div>
    </div>
  );
};

export default Headers;
