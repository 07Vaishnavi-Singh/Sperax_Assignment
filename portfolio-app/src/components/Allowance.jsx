import React, { useState } from 'react';
import { ethers } from 'ethers';

// Replace with actual ERC20 ABI
const ERC20_ABI = 
[
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [{"name": "", "type": "string"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [{"name": "", "type": "string"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [{"name": "", "type": "uint8"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "totalSupply",
      "outputs": [{"name": "", "type": "uint256"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
      "name": "transferFrom",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
      "name": "approve",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
      "name": "allowance",
      "outputs": [{"name": "", "type": "uint256"}],
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [{"indexed": true, "name": "from", "type": "address"}, {"indexed": true, "name": "to", "type": "address"}, {"indexed": false, "name": "value", "type": "uint256"}],
      "name": "Transfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [{"indexed": true, "name": "owner", "type": "address"}, {"indexed": true, "name": "spender", "type": "address"}, {"indexed": false, "name": "value", "type": "uint256"}],
      "name": "Approval",
      "type": "event"
    },
    {
      "constant": false,
      "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}, {"name": "_extraData", "type": "bytes"}],
      "name": "approveAndCall",
      "outputs": [{"name": "success", "type": "bool"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [{"name": "_amount", "type": "uint256"}],
      "name": "burn",
      "outputs": [{"name": "success", "type": "bool"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [{"name": "_from", "type": "address"}, {"name": "_amount", "type": "uint256"}],
      "name": "burnFrom",
      "outputs": [{"name": "success", "type": "bool"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [{"name": "_to", "type": "address"}, {"name": "_amount", "type": "uint256"}],
      "name": "mint",
      "outputs": [{"name": "success", "type": "bool"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "paused",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    }
  ];

  const Allowance = ({ walletAddress }) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [spenderAddress, setSpenderAddress] = useState('');
    const [allowance, setAllowance] = useState(null);
    const [error, setError] = useState('');
  
    const isValidAddress = (address) => ethers.utils.isAddress(address);
  
    const fetchAllowance = async () => {
      if (!isValidAddress(tokenAddress) || !isValidAddress(spenderAddress) || !walletAddress) {
        setError('Please provide valid token contract and spender addresses and connect your wallet.');
        return;
      }
  
      try {
        setError('');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const allowanceValue = await tokenContract.allowance(walletAddress, spenderAddress);
        const decimals = await tokenContract.decimals();
        const formattedAllowance = ethers.utils.formatUnits(allowanceValue, decimals);
        setAllowance(formattedAllowance);
      } catch (error) {
        console.error('Failed to fetch allowance:', error);
        setError('Failed to fetch allowance. Please check the addresses and try again.');
        setAllowance(null);
      }
    };
  
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Check Token Allowance</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter Token Contract Address"
            className="p-2 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={spenderAddress}
            onChange={(e) => setSpenderAddress(e.target.value)}
            placeholder="Enter Spender Address"
            className="p-2 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={fetchAllowance}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Check Allowance
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {allowance !== null && (
          <div className="mt-4">
            <h4 className="text-xl font-bold">Allowance:</h4>
            <p>{allowance} Tokens</p>
            <p>{parseFloat(allowance) > 0 ? 'Allowance granted' : 'No allowance granted'}</p>
          </div>
        )}
      </div>
    );
  };
  
  export default Allowance;