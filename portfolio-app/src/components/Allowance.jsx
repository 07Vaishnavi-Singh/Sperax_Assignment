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


  const Allowance = () => {
    const [tokenAddressForAllowance, setTokenAddressForAllowance] = useState('');
    const [tokenAddressForTransfer, setTokenAddressForTransfer] = useState('');
    const [tokenAddressForApproval, setTokenAddressForApproval] = useState('');
    const [spenderAddress, setSpenderAddress] = useState('');
    const [transferToAddress, setTransferToAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [approveAmount, setApproveAmount] = useState('');
    const [allowance, setAllowance] = useState(null);
    const [allowanceError, setAllowanceError] = useState('');
    const [transferError, setTransferError] = useState('');
    const [approveError, setApproveError] = useState('');
    const [success, setSuccess] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
  
    const isValidAddress = (address) => ethers.utils.isAddress(address);
  
    const fetchAllowance = async () => {
      if (!isValidAddress(tokenAddressForAllowance) || !isValidAddress(spenderAddress) || !walletAddress) {
        setAllowanceError('Please provide valid token contract and spender addresses and connect your wallet.');
        return;
      }
  
      try {
        setAllowanceError('');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const tokenContract = new ethers.Contract(tokenAddressForAllowance, ERC20_ABI, provider);
        const allowance = await tokenContract.allowance(walletAddress, spenderAddress);
        const decimals = await tokenContract.decimals();
        setAllowance(ethers.utils.formatUnits(allowance, decimals));
      } catch (error) {
        console.error('Failed to fetch allowance:', error);
        setAllowanceError('Failed to fetch allowance. Please check the addresses and try again.');
        setAllowance(null);
      }
    };
  
    const handleTransfer = async () => {
      if (!isValidAddress(tokenAddressForTransfer) || !isValidAddress(transferToAddress) || !transferAmount || !walletAddress) {
        setTransferError('Please provide valid transfer details and connect your wallet.');
        return;
      }
  
      try {
        setTransferError('');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(tokenAddressForTransfer, ERC20_ABI, signer);
        const decimals = await tokenContract.decimals();
        const tx = await tokenContract.transfer(transferToAddress, ethers.utils.parseUnits(transferAmount, decimals));
        await tx.wait();
        setSuccess('Transfer successful!');
      } catch (error) {
        console.error('Failed to transfer tokens:', error);
        setTransferError('Failed to transfer tokens. Please check the details and try again.');
        setSuccess('');
      }
    };
  
    const handleApprove = async () => {
      if (!isValidAddress(tokenAddressForApproval) || !isValidAddress(spenderAddress) || !approveAmount || !walletAddress) {
        setApproveError('Please provide valid approval details and connect your wallet.');
        return;
      }
  
      try {
        setApproveError('');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(tokenAddressForApproval, ERC20_ABI, signer);
        const decimals = await tokenContract.decimals();
        const tx = await tokenContract.approve(spenderAddress, ethers.utils.parseUnits(approveAmount, decimals));
        await tx.wait();
        setSuccess('Approval successful!');
      } catch (error) {
        console.error('Failed to approve tokens:', error);
        setApproveError('Failed to approve tokens. Please check the details and try again.');
        setSuccess('');
      }
    };
  

    return (
      <div className="bg-gray-900 text-white p-8 rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Token Operations</h2>
  
    
        {/* Check Allowance */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Check Token Allowance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-400">Token Contract Address</label>
              <input
                type="text"
                value={tokenAddressForAllowance}
                onChange={(e) => setTokenAddressForAllowance(e.target.value)}
                placeholder="Enter Token Contract Address"
                className="p-2 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-400">Spender Address</label>
              <input
                type="text"
                value={spenderAddress}
                onChange={(e) => setSpenderAddress(e.target.value)}
                placeholder="Enter Spender Address"
                className="p-2 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={fetchAllowance}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Check Allowance
          </button>
          {allowanceError && <p className="text-red-500 mt-4">{allowanceError}</p>}
          {allowance !== null && (
            <div className="mt-4">
              <h4 className="text-xl font-bold">Allowance:</h4>
              <p>{allowance} Tokens</p>
            </div>
          )}
        </div>
  
        {/* Transfer Tokens */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Transfer Tokens</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-400">Token Contract Address</label>
              <input
                type="text"
                value={tokenAddressForTransfer}
                onChange={(e) => setTokenAddressForTransfer(e.target.value)}
                placeholder="Enter Token Contract Address"
                className="p-2 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-400">Recipient Address</label>
              <input
                type="text"
                value={transferToAddress}
                onChange={(e) => setTransferToAddress(e.target.value)}
                placeholder="Enter Recipient Address"
                className="p-2 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block mb-2 text-gray-400">Amount</label>
            <input
              type="text"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Enter Amount"
              className="p-2 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleTransfer}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Transfer Tokens
          </button>
          {transferError && <p className="text-red-500 mt-4">{transferError}</p>}
        </div>
  
        {/* Approve Tokens */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Approve Tokens</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-400">Token Contract Address</label>
              <input
                type="text"
                value={tokenAddressForApproval}
                onChange={(e) => setTokenAddressForApproval(e.target.value)}
                placeholder="Enter Token Contract Address"
                className="p-2 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-400">Spender Address</label>
              <input
                type="text"
                value={spenderAddress}
                onChange={(e) => setSpenderAddress(e.target.value)}
                placeholder="Enter Spender Address"
                className="p-2 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block mb-2 text-gray-400">Amount</label>
            <input
              type="text"
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
              placeholder="Enter Amount"
              className="p-2 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleApprove}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Approve Tokens
          </button>
          {approveError && <p className="text-red-500 mt-4">{approveError}</p>}
        </div>
  
        {success && <p className="text-green-500 mt-4">{success}</p>}
      </div>
    );
  };
  
  export default Allowance;