import React, { useState } from 'react';
import { ethers } from 'ethers';

// Replace with actual ERC20 ABI
const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transfer(address to, uint256 value) returns (bool)",
    "function approve(address spender, uint256 value) returns (bool)",
    "function decimals() view returns (uint8)",
];

const Allowance = () => {
    const [contractAddress, setContractAddress] = useState('');
    const [spenderAddress, setSpenderAddress] = useState('');
    const [transferToAddress, setTransferToAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [approveAmount, setApproveAmount] = useState('');
    const [allowance, setAllowance] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [walletAddress, setWalletAddress] = useState('0xYourWalletAddress'); // Replace with your wallet address

    const fetchAllowance = async () => {
        if (!contractAddress || !spenderAddress) {
            setError('Please provide both token contract and spender addresses.');
            return;
        }

        try {
            const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
            const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
            
            // Fetch allowance
            const allowance = await tokenContract.allowance(walletAddress, spenderAddress);
            
            const decimals = await tokenContract.decimals(); // Get token decimals
            setAllowance(ethers.utils.formatUnits(allowance, decimals)); // Format allowance based on decimals
            setError('');
        } catch (error) {
            console.error('Failed to fetch allowance:', error);
            setError('Failed to fetch allowance. Please check the addresses and try again.');
            setAllowance(null);
        }
    };

    const handleTransfer = async () => {
        if (!contractAddress || !transferToAddress || !transferAmount) {
            setError('Please provide all transfer details.');
            return;
        }

        try {
            const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
            const signer = provider.getSigner(); // Get signer from provider
            const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
            
            const tx = await tokenContract.transfer(transferToAddress, ethers.utils.parseUnits(transferAmount, 18)); // Assuming 18 decimals
            await tx.wait(); // Wait for the transaction to be mined
            
            setSuccess('Transfer successful!');
            setError('');
        } catch (error) {
            console.error('Failed to transfer tokens:', error);
            setError('Failed to transfer tokens. Please check the details and try again.');
            setSuccess('');
        }
    };

    const handleApprove = async () => {
        if (!contractAddress || !spenderAddress || !approveAmount) {
            setError('Please provide all approval details.');
            return;
        }

        try {
            const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
            const signer = provider.getSigner(); // Get signer from provider
            const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
            
            const tx = await tokenContract.approve(spenderAddress, ethers.utils.parseUnits(approveAmount, 18)); // Assuming 18 decimals
            await tx.wait(); // Wait for the transaction to be mined
            
            setSuccess('Approval successful!');
            setError('');
        } catch (error) {
            console.error('Failed to approve tokens:', error);
            setError('Failed to approve tokens. Please check the details and try again.');
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
                            value={contractAddress}
                            onChange={(e) => setContractAddress(e.target.value)}
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
                {error && <p className="text-red-500 mt-4">{error}</p>}
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
                            value={contractAddress}
                            onChange={(e) => setContractAddress(e.target.value)}
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
            </div>

            {/* Approve Tokens */}
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Approve Tokens</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-gray-400">Token Contract Address</label>
                        <input
                            type="text"
                            value={contractAddress}
                            onChange={(e) => setContractAddress(e.target.value)}
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
            </div>

            {success && <p className="text-green-500 mt-4">{success}</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
};

export default Allowance;