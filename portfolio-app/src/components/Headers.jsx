import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import DatePicker from "react-datepicker"; // Make sure to install this package
import "react-datepicker/dist/react-datepicker.css";
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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [historicalBalances, setHistoricalBalances] = useState({});
  const [expandedToken, setExpandedToken] = useState(null);

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

  const fetchHistoricalBalance = async (tokenAddress, date) => {
    // Implement actual logic to fetch historical balances.
    return Math.random() * 100; // Placeholder random balance
  };

  const fetchHistoricalBalancesForRange = async (tokenSymbol) => {
    if (!startDate || !endDate || startDate > endDate) return;
    // For the sake of example, we assume you fetch balances for the entire range and select the data accordingly.
    const balances = {};
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const balance = await fetchHistoricalBalance(tokenSymbol, date);
      balances[date.toDateString()] = balance;
    }
    return balances;
  };

  const toggleHistoricalBalance = async (tokenSymbol) => {
    if (expandedToken === tokenSymbol) {
      setExpandedToken(null);
    } else {
      setExpandedToken(tokenSymbol);
      if (!historicalBalances[tokenSymbol]) {
        const balances = await fetchHistoricalBalancesForRange(tokenSymbol);
        setHistoricalBalances(prev => ({...prev, [tokenSymbol]: balances}));
      }
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
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      <header className="py-8 px-12 flex flex-col md:flex-row justify-between items-center shadow-lg">
        <h1 className="text-4xl font-extrabold mb-4 md:mb-0 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Crypto Portfolio
        </h1>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          {activeAddress && (
            <span className="text-green-400 font-semibold tracking-wider">
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
            } focus:outline-none focus:border-blue-500 transition duration-300`}
          />
          <button
            onClick={validateAddress}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:bg-gradient-to-l text-white font-bold py-2 px-8 rounded-lg transition duration-300"
          >
            Submit Address
          </button>
          {connectedWallet ? (
            <button
              onClick={disconnectWallet}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:bg-gradient-to-l text-white font-bold py-2 px-8 rounded-lg transition duration-300"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:bg-gradient-to-l text-white font-bold py-2 px-8 rounded-lg transition duration-300"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Center the OperationsBar */}
      <div className="flex justify-center my-6">
        <OperationsBar setActiveOperation={setActiveOperation} />
      </div>

      {!isAddressValid && (
        <p className="text-red-500 text-center mt-4 font-medium">Invalid Address</p>
      )}
      {isLoading && (
        <div className="text-center mt-10">
          <p className="text-xl animate-pulse">Loading token balances...</p>
        </div>
      )}
      {tokens.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10 p-8 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">Token Holdings</h2>
          <div className="mb-6 flex space-x-6">
            <div>
              <label className="block text-gray-400 mb-2">Start Date:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="bg-gray-700 text-white p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">End Date:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="bg-gray-700 text-white p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          <ul>
            {tokens.map((token, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-4 bg-gray-700 rounded-lg mb-4 shadow-md transition hover:bg-gray-600"
              >
                <div>
                  <p className="font-bold text-xl text-blue-400">
                    {token.name} ({token.symbol})
                  </p>
                  <p className="text-lg">Balance: {token.balance}</p>
                </div>
                <button
                  onClick={() => toggleHistoricalBalance(token.symbol)}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:bg-gradient-to-l text-white font-bold py-2 px-8 rounded-lg transition duration-300"
                >
                  {expandedToken === token.symbol
                    ? "Hide Historical Balances"
                    : "Show Historical Balances"}
                </button>
              </li>
            ))}
          </ul>

          {expandedToken && historicalBalances[expandedToken] && (
            <div className="mt-6 p-6 bg-gray-600 rounded-lg shadow-md">
              <h3 className="font-bold text-lg text-purple-400">
                Historical Balances for {expandedToken}
              </h3>
              <ul className="mt-2">
                {Object.entries(historicalBalances[expandedToken]).map(
                  ([date, balance]) => (
                    <li key={date} className="mt-2">
                      <span className="font-bold">{date}:</span> {balance}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Render the active operation component */}
      <div className="max-w-4xl mx-auto mt-10">
        {renderActiveOperation()}
      </div>
    </div>
  );
};

export default Headers;