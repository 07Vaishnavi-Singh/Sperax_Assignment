// Transfer.js
import React, { useState } from 'react';
import { ethers } from 'ethers';


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

const Transfer = ({ walletAddress }) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [txHash, setTxHash] = useState('');
  
    const isValidAddress = (address) => ethers.utils.isAddress(address);
    const isValidAmount = (amount) => /^[0-9]*[.,]?[0-9]+$/.test(amount) && parseFloat(amount) > 0;
  
    const handleTransfer = async () => {
      if (!isValidAddress(tokenAddress) || !isValidAddress(recipientAddress) || !isValidAmount(transferAmount) || !walletAddress) {
        setError('Please provide valid transfer details and connect your wallet.');
        return;
      }
  
      try {
        setError('');
        setSuccess('');
        setTxHash('');
  
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  
        // Fetch token details
        const tokenName = await tokenContract.name();
        const tokenSymbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
  
        // Parse the amount with the correct number of decimals
        const amountToTransfer = ethers.utils.parseUnits(transferAmount, decimals);
  
        // Check balance
        const balance = await tokenContract.balanceOf(walletAddress);
        if (balance.lt(amountToTransfer)) {
          setError(`Insufficient balance. You have ${ethers.utils.formatUnits(balance, decimals)} ${tokenSymbol}`);
          return;
        }
  
        // Send the transfer transaction
        const tx = await tokenContract.transfer(recipientAddress, amountToTransfer);
        setTxHash(tx.hash);
  
        // Wait for the transaction to be mined
        await tx.wait();
  
        setSuccess(`Successfully transferred ${transferAmount} ${tokenSymbol} (${tokenName}) to ${recipientAddress}`);
      } catch (error) {
        console.error('Failed to transfer tokens:', error);
        setError('Failed to transfer tokens. Please check the details and try again.');
      }
    };
  
    return (
      <div className="mb-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-white mb-6">Transfer Tokens</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter Token Contract Address"
            className="p-3 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Enter Recipient Address"
            className="p-3 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="mt-4">
          <input
            type="text"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            placeholder="Enter Amount"
            className="p-3 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600 w-full"
          />
        </div>
        <button
          onClick={handleTransfer}
          className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded shadow-lg hover:shadow-xl transition duration-300"
        >
          Transfer Tokens
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
        {success && <p className="text-green-400 mt-4">{success}</p>}
        {txHash && (
          <p className="text-blue-400 mt-4">
            Transaction Hash: <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a>
          </p>
        )}
      </div>
    );
  };
  
  export default Transfer;